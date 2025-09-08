import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Body,
	UseGuards,
	Query } from '@nestjs/common';

import {
	UsersService,
	PublicUserInfo,
	PublicAccountInfo } from './users.service';
import { User } from './users.entity';

import { UpdateUserDto } from './updateUser.dto';
import { getUser } from './user.decorator';
import { AuthenticationGuard } from 'src/auth/authentication.guard'
import { ChannelService } from 'src/chat/channels/channel.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly channelService: ChannelService
  ) {}

  //! is het wel een goed idee om dit als route erin te hebben? Wanneer zouden we de gebruiker deze informatie willen geven?
  // @Get()
  // @UseGuards(AuthenticationGuard)
  //   findAll(): Promise<User[]> {
  //     return this.userService.findAll();
  // }

  @Get('search')
  @UseGuards(AuthenticationGuard)
    async searchUsers(
		@Query('query') query: string
	): Promise<{username: string, id: number}[]> {
		try {
			return await this.userService.findByUsername(query);
		} catch (error) {
			throw error;
		}
	}
  
  @Patch()
  @UseGuards(AuthenticationGuard)
    async update(
      @getUser() user: User,
      @Body() updateUserDto: UpdateUserDto
    ) {
      try{
        await this.userService.update(user.id, updateUserDto);
        await this.channelService.updateDmName(user.id, user.username, updateUserDto.username);
      } catch (error){
        throw error;
      }
      return ;
  }

  @Get('account')
  @UseGuards(AuthenticationGuard)
  	async getAccount(
		@getUser() user: User): Promise<PublicAccountInfo> {
		return this.userService.getAccountById(user.id);
  	}
  
  @Get('public/:id')
  @UseGuards(AuthenticationGuard)
    getById(
		@Param('id', ParseIntPipe) id: number,
		@getUser() user: User): Promise<PublicUserInfo> {
	  return this.userService.findPublicById(id, user);
	}
}