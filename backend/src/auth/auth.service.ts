import { BadRequestException, Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.entity';
import { NewUser } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';


@Injectable()
export class AuthService{
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService
	) {}

	public async authenticateUser(newUser: NewUser) {
		const user = await this.usersService.findUser(newUser.userName);
		if (user == null)
			throw new BadRequestException("No user exists with that name");
		if (CryptoJS.SHA256(this.configService.getOrThrow('SALT') + newUser.password).toString() != user.password)
			throw new BadRequestException('Wrong password');
		return user;
	}

	public async register(newUser: NewUser) {
		newUser.password = CryptoJS.SHA256(this.configService.getOrThrow('SALT') + newUser.password).toString();
		await this.usersService.createUser(newUser);

		return;
	}

	public async generate2faSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.username, 'Transcendence', secret);

		await this.usersService.set2FaSecret(secret, user.id);
		
		return {
			secret, otpauthUrl
		}
	}
	
	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}

	public validate2FAcode(code: string, user: User) {
		return authenticator.verify ({
			token: code,
			secret: user.twofaAuthenticationSecret
		})
	}

	private temporaryCodes: Map<string, any> = new Map();

	storeTemporaryCode(code: string, userId: number) {
	  this.temporaryCodes.set(code, userId);
	}
  
	getUserDataByCode(code: string): number {
	  return this.temporaryCodes.get(code);
	}
  
	deleteTemporaryCode(code: string) {
	  this.temporaryCodes.delete(code);
	}
}