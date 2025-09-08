import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { RoomInfo } from './GameResources';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PrivateRoom } from './GamePrivate';
import { StatusModule } from 'src/status/status.module';
import { GameHistoryModule } from 'src/gamehistory/gamehistory.module';
import { RankingModule } from 'src/users/ranking/ranking.module';
import { UsersModule } from 'src/users/users.module';
import { RankingService } from 'src/users/ranking/ranking.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
      StatusModule,
      GameHistoryModule,
      UsersModule,
      RankingModule,
      AuthModule
    ],
    controllers: [RoomController],
    providers: [
      GameGateway,
      RoomInfo,
      RoomService,
      RoomController,
      PrivateRoom],
    exports:[
      GameGateway,
      RoomInfo,
      RoomController,
      RoomService,
      PrivateRoom
    ]
  })
export class GameModule {}