import { Module, forwardRef } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusGateway } from './status.gateway';
import { Status } from './Status';
import { UsersModule } from 'src/users/users.module';
import { GameModule } from 'src/game/game.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        UsersModule,
        forwardRef(() => GameModule),
        AuthModule
    ],
    controllers: [StatusController],
    providers: [StatusGateway, Status],
    exports:[StatusGateway, Status]
})
export class StatusModule {}