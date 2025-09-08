import {
	Module,
	forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { User } from '../users.entity';
import { UsersModule } from '../users.module';
import {FileLockService} from './file-lock.service'

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		forwardRef(() => UsersModule)
	],
	controllers: [AvatarController],
	providers: [
		AvatarService,
		FileLockService],
})

export class AvatarModule {}
