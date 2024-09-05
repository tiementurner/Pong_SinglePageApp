import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FriendsModule } from './friends/friends.module';
import { FriendRequestModule } from './friends/friendrequest/friendrequest.module';
import { NotificationModule } from './notification/notification.module'
import { User } from './users/users.entity';
import { WinlossdrawModule } from './gamehistory/winlossdraw/winlossdraw.module';
import { RankingModule } from './users/ranking/ranking.module';
import { GameModule } from './game/game.module';
import { GameInvitationModule } from './game_invitation/game_invitation.module';
import { StatusModule } from './status/status.module';
import { ParseStringPipe } from './custompipes/ParseStringPipe'

@Global()
@Module({
  controllers: [],
  providers: [ParseStringPipe],
  imports: [
      TypeOrmModule.forRootAsync({
        imports:[ConfigModule],
        useFactory: (configService: ConfigService) => ({// postgres info staat in .env file in backend/.env
          type: 'postgres',
          host: configService.getOrThrow('DATABASE_HOST'),
          port: configService.getOrThrow('DATABASE_PORT'),
          username: configService.getOrThrow('DATABASE_USERNAME'),
          password: configService.getOrThrow('DATABASE_PASSWORD'),
          database: configService.getOrThrow('DATABASE_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false
        }),
        inject: [ConfigService]
      }),
      RankingModule,
      GameModule, 
      GameInvitationModule, 
      StatusModule,
      UsersModule, 
      AuthModule, 
      ChatModule,
      WinlossdrawModule,
      FriendsModule,
      FriendRequestModule,
      NotificationModule,
      ConfigModule.forRoot({
        isGlobal: true
      }),
      TypeOrmModule.forFeature([User])
    ],
})
export class AppModule {}
