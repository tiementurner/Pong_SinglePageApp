import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FortyTwoStrategy } from './42.strategy';

import { UsersModule } from 'src/users/users.module';
import { TwoFactorAuthController } from './TwoFactorAuth/TwoFactorAuth.controller';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
	imports: [
		UsersModule,
		PassportModule.register({defaultStrategy: '42'})
	],
	providers: [
		AuthService,
		FortyTwoStrategy
	],
	controllers: [
		AuthController,
		TwoFactorAuthController
	],
	exports:[AuthService]
})

export class AuthModule {}