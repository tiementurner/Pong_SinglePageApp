import { Body, Controller, ForbiddenException, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { AuthenticationGuard } from '../authentication.guard';
import { IsString } from 'class-validator';
import { getUser } from 'src/users/user.decorator';
import { User } from 'src/users/users.entity';
import { Request } from 'express';
import { UserSession } from '../auth.controller';

class TwoFaCode {
    @IsString()
    code: string
}

//types fixen (express request & Usersession)
@Controller('TwoFactorAuth')
export class TwoFactorAuthController {
	constructor(
        private readonly authService : AuthService,
        private readonly userService : UsersService
    ){}
    
    @Post('authenticate2Fa')
    @UseGuards(AuthenticationGuard)
    async authenticate(
        @Req() req : Request & {session : UserSession },
        @Body() body : TwoFaCode,
        @getUser() user: User
    ){
        const isValid = this.authService.validate2FAcode(body.code, user);
        if (!isValid) {
            throw new UnauthorizedException("Wrong code");// Forbidden?
        }
        req.session.TwofaAuthenticated = true;
        return;
    }

    @Get('check2FA')
    @UseGuards(AuthenticationGuard)
    async check2FA(
        @getUser() user: User
    ) {
        if (user.is2FAenabled === true){
            return true;
        }
        if (user.is2FAenabled === false){
            return false;
        }
    }


    @Get('generate2FA')
    @UseGuards(AuthenticationGuard)
    async register2FA(
        @Res() res: any,
        @getUser() user: User
    ) {
        const {otpauthUrl} = await this.authService.generate2faSecret(user);
        return this.authService.pipeQrCodeStream(res, otpauthUrl);
    }

    @Post('verify2FA')
    @UseGuards(AuthenticationGuard)
    async enable2FAforUser(
        @Body() body : TwoFaCode,
        @getUser() user: User
    ) {
        const isValid = this.authService.validate2FAcode(body.code, user);

        if (!isValid) {
            throw new ForbiddenException("Wrong code");
        }
        await this.userService.set2FAenabled(user.id);

        return;
    }

    @Post('disable2Fa')
    @UseGuards(AuthenticationGuard)
    async disable2Fa(
        @getUser() user: User
    ) {
        await this.userService.set2FAdisabled(user.id); 
        return;
    }
}
