import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from "./entities/message.entity"
import { messageService } from './message.service';

@Module({
	imports:[ TypeOrmModule.forFeature([Message])],
	providers: [messageService],
	exports: [messageService]
})

export class messageModule {}