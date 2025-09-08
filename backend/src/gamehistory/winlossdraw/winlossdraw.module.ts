import { Module } from '@nestjs/common';
import { WinlossdrawController } from './winlossdraw.controller';
import { GameHistoryModule } from '../gamehistory.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [GameHistoryModule, UsersModule],
  controllers: [WinlossdrawController],
})
export class WinlossdrawModule {}
