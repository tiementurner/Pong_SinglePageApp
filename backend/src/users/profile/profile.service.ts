import { Injectable } from '@nestjs/common';
import { ProfileUserDto } from './dto/profileUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users.entity';

@Injectable()
export class ProfileService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findProfile(id: number): Promise<ProfileUserDto> {
    const userProfile: ProfileUserDto = await this.userRepository.findOne({select: {id: true, username: true, email: true, image: true, score: true}, where: {id}});
    if (!userProfile) {
      return null;
      //throw new NotFoundException(`User with ID ${id} not found`);
    }
    return userProfile;
  }
}
