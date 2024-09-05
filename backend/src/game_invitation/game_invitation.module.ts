
import { GameModule } from 'src/game/game.module';
import { PrivateController } from './private.controller';
import { RoomInfo } from 'src/game/GameResources';
import { GameGateway } from 'src/game/game.gateway';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [GameModule, UsersModule],
    controllers: [PrivateController],
    exports:[]
})
export class GameInvitationModule {}
