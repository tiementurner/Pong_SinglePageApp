import { Module, forwardRef } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users.entity';
import { UsersModule } from '../users.module';

@Module({
  imports:[TypeOrmModule.forFeature([User]), forwardRef(() => UsersModule)],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
