import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as CryptoJS from 'crypto-js';

import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { MemberService } from '../members/member.service';
import { Member } from '../members/entities/member.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.entity';

export interface ChannelInfoType {
	members: Member[];
	admins: number[];
	userIsAdmin: boolean;
	userIsOwner: boolean;
	isPrivate: boolean;
	isDM: boolean;
	name: string;
}

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel)
		private readonly channelRepository: Repository<Channel>,
		private readonly memberService: MemberService,
		private readonly userService : UsersService,
		private readonly configService: ConfigService
	) {}

	async create(data: any, user: User): Promise<Channel> {
		
		if (data.name == null)
			throw new BadRequestException("no name specified.");
		
		let password = data.password;

		if (password === '')
			password = null;
		if (password !== null) {
			password = CryptoJS.SHA256(this.configService.getOrThrow('SALT') + password).toString();
		};

		const createChannelDto: CreateChannelDto = {
			name : data.name,
			isPrivate: data.isPrivate,
			password: password,
			isDM: false
		};

		if (await this.existsByName(data.name))
			throw new BadRequestException(`Channel ${data.name} already exists.`);
		
		const newChannel = this.channelRepository.create({...createChannelDto});
		const savedChannel = await this.channelRepository.save(newChannel);

		await this.memberService.addMember(savedChannel, user, true, true);
		return savedChannel;
	}

	async createDM(user: User, targetUserId: number): Promise<Channel> {
		
		const targetUser = await this.userService.findById(targetUserId);

		if (!user || !targetUser)
			throw new NotFoundException('1 of the users not found.');
		if (user == targetUser)
			throw new BadRequestException('Can\'t direct message with yourself');

		const createChannelDto: CreateChannelDto = {
			name : user.username + targetUser.username,
			isPrivate: true,
			password: null,
			isDM: true
		};

		if (await this.existsByName(user.username + targetUser.username))
			return this.findByName(user.username + targetUser.username);
		if (await this.existsByName(targetUser.username + user.username))
			return this.findByName(targetUser.username + user.username);

		const DMchannel = this.channelRepository.create({...createChannelDto});
		const savedChannel = await this.channelRepository.save(DMchannel);

		await this.memberService.addMember(savedChannel, user, true, true);
		await this.memberService.addMember(savedChannel, targetUser, true, true);

		return savedChannel;
	}

	async join(channelId: number, user: User, password: string): Promise<Channel> {
	
		const channel = await this.findById(channelId);

		if (!channel)
			throw new NotFoundException('No channel found by that name.');
		if (channel.password !== null) {
			if (password == null)
				throw new BadRequestException("No password specified.");
			if (CryptoJS.SHA256(this.configService.getOrThrow('SALT') + password).toString() !== channel.password)
				throw new ForbiddenException("Wrong password.");
		}
		if (await this.memberService.findMember(channel.id, user.id))
			return channel;
		if (await this.memberService.findBannedMember(channel.id, user.id))
			throw new ForbiddenException("User is banned.");

		await this.memberService.addMember(channel, user, false, false);
		return channel;
	}

	async getChannelMembers(channelId: number) {

		const channel = await this.findById(channelId);

		if (!channel)
			throw new NotFoundException("channel not found.");

		const members = await this.memberService.getMembers(channel.id);

		members.forEach(member => {
			member['isAdmin'] = member.members[0].isAdmin;
			delete member.members[0].isAdmin;
			member['isOwner'] = member.members[0].isOwner;
			delete member.members[0].isOwner;
		});

		return members;
	}

	async getChannelInfo(channelId: number, user: User) {

		let channelInfo: ChannelInfoType = {
			members: [],
			admins: [],
			userIsAdmin: false,
			userIsOwner: false,
			isPrivate: false,
			isDM: false,
			name: ''
		};

		/** Get memberlist */
		channelInfo.members = await this.getChannelMembers(channelId);

		/** Use memberlist to get array of admins, and to find out if user is a channel owner */
		channelInfo.admins = channelInfo.members.filter(member => member.isAdmin === true).map(member => member.id);
		if (channelInfo.admins.includes(user.id))
			channelInfo.userIsAdmin = true;

		const channelOwners = channelInfo.members.filter(member => member.isOwner === true).map(member => member.id);
		if (channelOwners.includes(user.id))
			channelInfo.userIsOwner = true;
		
		/** Get channel */
		const channel = await this.findById(channelId);
		channelInfo.isPrivate = channel.isPrivate;
		channelInfo.isDM = channel.isDM;
		channelInfo.name = channel.name;

		return channelInfo;
	}

  	async kick(channelId: number, userId: number, kickId: number) {

		const channel = await this.findById(channelId);
		const userToKick = await this.userService.findById(kickId);

		if (!channel  || !userToKick)
			throw new NotFoundException("channel or user not found.");
		if (kickId == userId)
			throw new BadRequestException("cannot kick yourself.");
		if (!await this.memberService.kickMember(userId, userToKick.id, channel))
			throw new ForbiddenException("missing required privileges to kick.");
		
		return;
	}

  	async ban(channelId: number, userId: number, banId: number) {

		const channel = await this.findById(channelId);
		const userToKick = await this.userService.findById(banId);
		
		if (!channel || !userToKick)
			throw new NotFoundException("channel or user not found.");
		if (banId == userId)
			throw new BadRequestException("cannot ban yourself.");
		if (!await this.memberService.banMember(userId, userToKick.id, channel, userToKick))
			throw new ForbiddenException("missing required privileges to ban.");
		
		return;
  	}

	async mute(channelId: number, userId: number, muteId: number) {

		const channel = await this.findById(channelId);
		const userToMute = await this.userService.findById(muteId);

		if (!channel  || !userToMute)
			throw new NotFoundException("channel or user not found.");
		if (muteId == userId)
			throw new BadRequestException("cannot mute yourself.");
		if (!await this.memberService.muteMember(userId, userToMute.id, channel))
			throw new ForbiddenException("missing required privileges to mute.");
		
		return;
	}

	async setAdmin(channelId: number, ownerId: number, adminId: number) {

		const channel = await this.findById(channelId);
		const futureAdmin = await this.userService.findById(adminId);

		if (!channel || !futureAdmin)
			throw new NotFoundException("channel or user not found.");
		if (!await this.memberService.setAdmin(ownerId, futureAdmin.id, channel))
			throw new ForbiddenException("missing required privileges to make user an admin.");

		return;
	}

	async findAllChannelsFromUser(id: number): Promise<Channel[]> {

		const channels: Channel[] = await this.channelRepository
			.createQueryBuilder('channel')
			.innerJoin('channel.members', 'member')
			.where('member.user = :userId', { userId: id })
			.select([
				'channel.id',
				'channel.name',
				'channel.isPrivate',
				'channel.isDM'
			])
			.getMany();
			
		return channels
	}

	async findAllPublicChannels(): Promise<Channel[]> {

		const channels: Channel[] = await this.channelRepository
			.createQueryBuilder('channel')
			.where('channel.isPrivate = false')
			.andWhere('channel.isDM = false')
			.select([
				'channel.id',
				'channel.name',
				'channel.isPrivate',
				'channel.isDM'
			])
			.getMany();

		return channels
	}

	async existsByName(searchTerm: string) {

		const exists = await this.channelRepository.existsBy({name: searchTerm });
		return (exists);
	}

	async findByName(name: string) {
		
		if (name == null)
			return null;

		const channel = await this.channelRepository.findOne({where: {name}});
		return channel;
	}

	async searchByName(name: string): Promise<Channel[]> {

		if (name == null)
			return [];

		const channels: Channel[] = await this.channelRepository
			.createQueryBuilder('channel')
			.where("channel.name like '%' || :name || '%'", {name: name})
			.andWhere("channel.isDM = false")
			.select([
				'channel.id',
				'channel.name',
				'channel.isPrivate'
			])
			.getMany();
		
		return channels;
	}

  	async findById(channelId: number) {
		
		if (channelId == null)
			return null;
		
		const channel = await this.channelRepository.findOne({where: {id: channelId}});
		return channel;
	}

	async remove(channelId: number, user: User) {

		const channel = await this.findById(channelId);

		if (!channel || !user)
			throw new NotFoundException("channel or user not found");

		const member = await this.memberService.findMember(channel.id, user.id);

		if (!member)
			throw new NotFoundException(`${user.username} is not a member of channel ${channel.name}`);
		if (!member.isOwner)
			throw new ForbiddenException(`${user.username} is not the owner of ${channel.name}`);
		
		await this.channelRepository.remove(channel);
		return;
	}

	async leave(channelId: number, user: User) {

		const channel = await this.findById(channelId);

		if (!channel || !user)
			throw new NotFoundException("channel or user not found");
		if (channel.isDM === true) {
			await this.channelRepository.remove(channel);
			return;
		}
		if (!await this.memberService.removeMember(channel, user))
			await this.channelRepository.remove(channel);

		return;
	}

	async changePassword(channelId: number, user: number, data: any) {
    
		const channel = await this.findById(channelId);
		const member = await this.memberService.findMember(channelId, user);

		if (!member.isOwner)
			throw new ForbiddenException("missing required privileges to change password");
		
		if (data.password == '')
			throw new ForbiddenException("password cannot be empty.");

		let password = data.password;

		if (password == null)
			throw new BadRequestException("no password provided");

		channel.password = CryptoJS.SHA256(this.configService.getOrThrow('SALT') + password).toString();
		const updatedChannel = this.channelRepository.create(channel);

		await this.channelRepository.update(channelId, {...updatedChannel});
	}

	async addPassword(channelId: number, user: number, data: any) {

		const channel = await this.findById(channelId);
		const member = await this.memberService.findMember(channelId, user);

		if (!member.isOwner)
			throw new ForbiddenException("missing required privileges to add password");

		if (data.password == '')
			throw new ForbiddenException("password cannot be empty.");

		let password = data.password;

		if (password == null)
			throw new BadRequestException("no password provided");

		channel.password = CryptoJS.SHA256(this.configService.getOrThrow('SALT') + password).toString();
		channel.isPrivate = !channel.isPrivate;

		const updatedChannel = this.channelRepository.create(channel);

		await this.channelRepository.update(channelId, {...updatedChannel});
	}

	async removePassword(channelId: number, user: number) {
    
		const channel = await this.findById(channelId);
		const member = await this.memberService.findMember(channelId, user);
		
		if (!member.isOwner)
			throw new ForbiddenException("missing required privileges to remove password");

		channel.password = null;
		channel.isPrivate = !channel.isPrivate;

		const updatedChannel = this.channelRepository.create(channel);

		await this.channelRepository.update(channelId, {...updatedChannel})
	}

	async updateDmName(userId: number, oldUsername: string, newUsername: string) {
		const DMchannels = await this.channelRepository
		.createQueryBuilder('channel')
        .innerJoin('channel.members', 'member')
        .where('member.userId = :userId', { userId })
        .andWhere('channel.isDM = true')
        .getMany();

		DMchannels.forEach(async channel => {
			const otherMember = await this.memberService.getMembers(channel.id);
			let otherUsername: string;
			otherMember.forEach(member => {
				if (member.id != userId)
					otherUsername = member.username;
			});
			channel.name = newUsername + otherUsername;
			await this.channelRepository.update(channel.id, channel)
		})
	}
}
