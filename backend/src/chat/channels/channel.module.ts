import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entity';
import { MemberModule } from '../members/member.module';
import { MemberService } from '../members/member.service';
import { Member } from '../members/entities/member.entity';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/users.entity';
import { Banned } from '../members/entities/banned.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Channel, Member, Banned, User]),
		MemberModule,
		forwardRef(()=>UsersModule)
	],
	controllers: [ChannelController],
	providers: [
		ChannelService,
		MemberService
	],
	exports: [ChannelService]
})

export class ChannelModule {}
