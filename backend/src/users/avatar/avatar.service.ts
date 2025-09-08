import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users.entity';

@Injectable()
export class AvatarService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}


	add(id: number, newFileName: string) {
		//find user with id, then change image to newFileName and save
		return this.userRepository.update(id, {image: newFileName});
	}

	remove(id: number) {
		//find user with id, change image back to default.png
		return this.userRepository.update(id, {image: "default.png"});
	}

	async getFileNameById(id: number): Promise<any> {
		const data = await this.userRepository
		.createQueryBuilder('user_info')
			.where('user_info.id = :id', {id: id})
			.select([
				'user_info.image'
			])
			.getOne();
		return data;
	}
}
