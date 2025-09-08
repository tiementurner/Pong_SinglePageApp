import {
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	Request,
	Response } from 'express';
import { Session } from 'express-session'
import { ConfigService } from '@nestjs/config';

import { AuthenticationGuard } from './authentication.guard';
import { User } from 'src/users/users.entity';
import { getUser } from 'src/users/user.decorator';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { IsString } from 'class-validator';


export interface UserSession extends Session {
	userId?: number;
	TwofaAuthenticated?: boolean;
}

export class NewUser {
	@IsString()
	userName: string;
	
	@IsString()
	password: string;
}

@Controller('auth')
export class AuthController {
	constructor(
		private readonly configService : ConfigService,
		private readonly authService: AuthService
	) {}

	@Get('login42')
	@UseGuards(AuthGuard('42'))
	async login42() {}

	@Get('login/callback')
	@UseGuards(AuthGuard('42'))
	async loginCallback(
		@Req() req: Request & {session : UserSession } & { user: User}, 
		@Res() res : Response
	) {
		req.session.userId = req.user.id;
		//req.session.userName = req.user.username;
		req.session.TwofaAuthenticated = false;
		if (req.user.is2FAenabled === true) {
			res.redirect(`${this.configService.getOrThrow('FRONTEND_URL')}/TwoFactorAuth`);
		} else if (req.user.is2FAenabled === false){
			req.session.TwofaAuthenticated = true;
			res.redirect(`${this.configService.getOrThrow('FRONTEND_URL')}/LoginSuccess`);
		}
	}

	@Post('login')
	async login (
		@Body() newUser: NewUser,
		@Req() req: Request & {session : UserSession } & { user: User}
	) {
		try {
			const user = await this.authService.authenticateUser(newUser);
			req.session.userId = user.id;
			return {url: `${this.configService.getOrThrow('FRONTEND_URL')}/`}
		} catch (error) {
			throw error
		}
	}

	@Post('register')
	async register(
		@Body() newUser: NewUser
	) {
		try {
			await this.authService.register(newUser);
		} catch (error) {
			throw error;
		}
	}

	
	@Get('login/testuser')
	async testuser (
		@Req() req: Request & {session : UserSession },
		@Res() res : Response
	) {
		req.session.userId = 666;
		req.session.TwofaAuthenticated = true;
		res.redirect(`${this.configService.getOrThrow('FRONTEND_URL')}/LoginSuccess`);
	}

	@Get('login/testuser2')
	async testuser2 (
		@Req() req: Request & {session : UserSession },
		@Res() res : Response
	) {
		req.session.userId = 1;
		req.session.TwofaAuthenticated = true;
		res.redirect(`${this.configService.getOrThrow('FRONTEND_URL')}/LoginSuccess`);
	}


	@Get('authenticate')
	@UseGuards(AuthenticationGuard)
	async authenticate(
		@Req() req: Request & {session : UserSession },
		@getUser() user: User
	) {	
		if (req.session.TwofaAuthenticated === false) {
			throw new UnauthorizedException("User is not yet authenticated by second factor");
		}
		return {id: user.id};
	}

	@Get('logout')
	@UseGuards(AuthenticationGuard)
	async logout(
		@Req() req: Request,
		@Res() res: Response
	) {
		try {
			req.session.destroy(function(err) {
				if (err) {
					throw new InternalServerErrorException("Something went wrong");
				} else {
					res.clearCookie('sessionID');
					return res.status(200).end();
				}
			});
		} catch (error) {
			throw new InternalServerErrorException("Something went wrong");
		}
	}

	@Get('socketAuth')
	@UseGuards(AuthenticationGuard)
	async generateSocketAuthCode(
		@getUser() user: User,
	) {
		const code = crypto.randomBytes(16).toString('hex');
		this.authService.storeTemporaryCode(code, user.id);
  
		return code
	}
}

