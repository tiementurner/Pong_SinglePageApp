import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'passport';
import { Repository } from 'typeorm';

import { CreateUserDto } from './createUser.dto';
import { User } from './users.entity';
import { Friend } from 'src/friends/entities/friend.entity';
import { UpdateUserDto } from './updateUser.dto';
import { FriendsService } from 'src/friends/friends.service';
import { StatsHistoryData } from 'src/gamehistory/gamehistory.controller';
import { GameHistoryService } from 'src/gamehistory/gamehistory.service';
import { NewUser } from 'src/auth/auth.controller';
export interface PublicUserInfo {
	username: string;
	id: number;
	avatar: string;
	friends: User[];
	statsHistory: StatsHistoryData;
	isFriend: boolean;
}
export interface PublicAccountInfo {
	username: string;
	image: string;
	is2FAenabled: boolean;
};

@Injectable()
export class UsersService {
  	constructor(
    	@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly gameHistoryService: GameHistoryService
	) {}

	//! removed this route for security purposes
	// async findAll(): Promise<User[]> {
    // 	return await this.userRepository.find();
	// }

	async findById(id: number): Promise<User> {

		if (id == null)
			return null;

		const user = await this.userRepository.findOne({where: {id}});
		if (!user) {
			return null;
			//throw new NotFoundException(`User with ID ${id} not found`);
		}
		return user;
	}

  	async findPublicById(id: number, sessionUser: User): Promise<PublicUserInfo> {
    	
		if (id == null)
      		return null;
    
		const isUser = id === sessionUser.id ? true : false;
    	const user = isUser? sessionUser : await this.findById(id);

    	if (user == null)
      		throw new NotFoundException("user does not exist");

		let publicInfo : PublicUserInfo = {
			username: user.username,
			id: user.id,
			avatar: user.image,
			friends: await this.userRepository
			.createQueryBuilder('user')
			.select(['user.id', 'user.username'])
			.innerJoin(Friend, 'friend', 'friend.senderId = user.id OR friend.receiverId = user.id')
			.where('(friend.senderId = :userId OR friend.receiverId = :userId)', { userId: id })
			.andWhere('friend.accepted = true')
			.getMany(),
			statsHistory: await this.gameHistoryService.getPublic(id),
			isFriend: false
		};

		publicInfo.friends.forEach((user, index) => {
			if (user.id == id) {
				publicInfo.friends.splice(index, 1);
			}
		})

		publicInfo.friends.forEach((user) => {
			if (user.id == sessionUser.id) {
				publicInfo.isFriend = true;
			}
		})

		return publicInfo;
  	}

	async findUser(username: string): Promise <{username:string, id: number, password:string}> {//for finding user trying to login
		if (!username) return null;  // Null check for empty username
		
		const user = await this.userRepository
			.createQueryBuilder('user_info')
			.where("LOWER(user_info.username) = LOWER(:username)", { username })
			.select([
			'user_info.username',
			'user_info.id',
			'user_info.password'
			])
			.getOne();
		
		return user;
	}

	async findByUsername(username: string): Promise<{username: string, id: number}[]> {//for search function in app
		
		if (username == null || username == "")
			return null; 
		
		const users = await this.userRepository
			.createQueryBuilder('user_info')
			.where("user_info.username like :username || '%'", {username: username})
			.select([
				'user_info.username',
				'user_info.id'
			])
			.getMany();

		return users;
	}

	async getAccountById(id: number): Promise<PublicAccountInfo> {
		
		const data = await this.userRepository
			.createQueryBuilder('user_info')
			.where('user_info.id = :id', {id: id})
			.select([
				'user_info.username',
				'user_info.image',
				'user_info.is2FAenabled'
			])
			.getOne();
		
		return data;
	}

  async set2FAenabled(userId: number) {
	return this.userRepository.update(userId, {is2FAenabled: true});
  }

  async set2FAdisabled(userId: number) {
	return this.userRepository.update(userId, {is2FAenabled: false});
  }

  async set2FaSecret(secret: string, userId: number) {
	return this.userRepository.update(userId, {twofaAuthenticationSecret: secret});
  }

  async findOrCreateUser(profile: Profile): Promise<User> {

    let user = await this.findById(parseInt(profile.id));
    if (user === null) {
      const newUserDto = {
        username: profile.username,
        email: profile.emails[0].value,
        image: 'default.png',
        twofaenabled: "false"
      };
      const newUser = this.userRepository.create({...newUserDto});
      return await this.userRepository.save(newUser);
    }
    return (user);
  }

  async createUser(newUser: NewUser): Promise<User> {

	const existingUser = await this.userRepository.findOne({ where: { username: newUser.userName } });
  
	if (existingUser) {
	  throw new BadRequestException('Username already exists');
	}
	const newUserDto = {
        username: newUser.userName,
        email: "",
        image: 'default.png',
        twofaenabled: "false",
		password: newUser.password
      };
    const user = this.userRepository.create({...newUserDto});
    return await this.userRepository.save(user);
  }


//! lege username check?
  async update(id: number, updateUser: UpdateUserDto) {
	const username = updateUser.username
    const user = await this.userRepository.createQueryBuilder('user')
        .where('user.username ILIKE :username', { username })
        .getOne();

    if (user) {
        throw new ForbiddenException('Username already in use');
    }
    await this.userRepository.update(id, {...updateUser});
    return this.userRepository.findOne({where: {id}});
  }

  async remove(id: number) {
    //should also remove avatar with the same id
    const userToRemove = await this.userRepository.findOne({where: {id}});
    await this.userRepository.remove(userToRemove);
  }
}
