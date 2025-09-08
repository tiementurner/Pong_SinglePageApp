import {
	BadRequestException,
	Injectable,
	NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from 'src/users/users.service';
import { BlockList } from './blockedlist.entity';
import { User } from 'src/users/users.entity';

@Injectable()
export class ChatService {
	constructor(
    	@InjectRepository(BlockList)
      	private readonly blockListRepository: Repository<BlockList>,
    	private readonly userService: UsersService
	) {}

	async blockUser(blocker: User, blockedId: number) {

		const blocked = await this.userService.findById(blockedId);
	
		if (!blocked)
			throw new NotFoundException(`User ${blockedId} not found`);
		if (blocker.id == blocked.id)
			throw new BadRequestException("Cannot block yourself");

		const entry = await this.blockListRepository.findOne({
			where: {
				blocker: {id: blocker.id},
				blocked: {id: blocked.id}}
			});
		
		if (entry)
			return;

		const blockListEntry = this.blockListRepository.create({blocker: blocker, blocked: blocked});
		await this.blockListRepository.save(blockListEntry);
		return;
	}
  
	async unblockUser(blocker: User, blockedId: number) {
	
		const blocked = await this.userService.findById(blockedId);
	
		if (!blocked)
			throw new NotFoundException(`User ${blockedId} not found`);
		if (blocker.id == blocked.id)
			throw new BadRequestException("Cannot unblock yourself");

		const entry = await this.blockListRepository.findOne({
			where: {
				blocker: {id: blocker.id},
				blocked: {id: blocked.id} }
			});

		if (!entry)
			throw new NotFoundException(`${blockedId} was not blocked`);

		const blockListEntry = await this.blockListRepository.findOne({where: {blocker: {id: blocker.id}, blocked: {id: blocked.id}}});
		await this.blockListRepository.remove(blockListEntry);
	
		return;
	}

	async getBlockers(user: User) {
	
		const blockListEntries = await this.blockListRepository.find({
			where: {
				blocked: { id: user.id }
			},
			relations: ['blocker']
		});
		const blockers = blockListEntries.map(entry => entry.blocker.id);
	
		return blockers;
	}

	async getBlocked(user: User) {

		const blockListEntries = await this.blockListRepository.find({
			where: {
				blocker: { id: user.id }
			},
			relations: ['blocked']
		});
		const blockers = blockListEntries.map(entry => entry.blocked.id);
	
		return blockers;
	}
}