import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileUserDto } from './dto/profileUser.dto';
import { AuthenticationGuard } from 'src/auth/authentication.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  @UseGuards(AuthenticationGuard)
  findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ProfileUserDto>  {
    return this.profileService.findProfile(+id);
  }
}
