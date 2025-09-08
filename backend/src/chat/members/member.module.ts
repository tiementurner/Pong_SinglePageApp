import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './member.service';
import { ScheduleModule } from '@nestjs/schedule';

import { Member } from './entities/member.entity';
import { Banned } from './entities/banned.entity'
import { User } from 'src/users/users.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Member, Banned, User]),
        ScheduleModule.forRoot()
    ],
    providers: [MemberService],
    exports: [MemberService]
})

export class MemberModule {}