import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {Strategy} from 'passport-42'
import {Profile} from 'passport'
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	constructor(
		private readonly userService : UsersService,
		private readonly configService: ConfigService
	) {
		super({
			clientID: configService.getOrThrow('CLIENT_ID'),
			clientSecret: configService.getOrThrow('CLIENT_SECRET'),
			callbackURL: configService.getOrThrow('CALLBACK_URL'),
			profileFields: {
				id: 'id',
				username: 'login',
				'emails.0.value': 'email',
				'photos.0.value': 'image.link'
			  }
		});
	}
	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = await this.userService.findOrCreateUser(profile);
		return (user);
	  }
}