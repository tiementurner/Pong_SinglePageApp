import { Module} from '@nestjs/common';
import { NotificationService} from './notification.service'
import { NotificationGateway } from './notification.gateway';
import { NotificationController} from './notification.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/notification/entities/notification.entity';
import { FriendsModule } from 'src/friends/friends.module';
import { GameModule } from 'src/game/game.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports:[
        UsersModule,
        TypeOrmModule.forFeature([Notification]),
		FriendsModule, 
        GameModule,
        AuthModule
    ],
    controllers: [
        NotificationController
    ],
    providers: [
        NotificationService,
        NotificationGateway
    ],
    exports: []
})

export class NotificationModule {}
