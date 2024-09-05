import {
	Injectable,
	NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
	LessThan,
	Repository } from "typeorm";
import {
	Cron,
	CronExpression } from '@nestjs/schedule';

import { Member } from "./entities/member.entity";
import { Channel } from "../channels/entities/channel.entity";
import { User } from "src/users/users.entity";
import { Banned } from "./entities/banned.entity";

function check_privileges(admin: Member, member: Member) {

	if (admin.isAdmin !== true)
    	return false;
	if (member.isOwner === true)
    	return false;

	return true;
}

@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(Member)
        	private readonly memberRepository: Repository<Member>,
        @InjectRepository(Banned)
        	private readonly bannedRepository: Repository<Banned>,
        @InjectRepository(User)
        	private readonly userRepository: Repository<User>
    ) {}

    async addMember(channel: Channel, user: User, isOwner: boolean, isAdmin: boolean) {
    
		if (channel == null || user == null)
    		return null;

      	const member = this.memberRepository.create({ channel, user, isOwner, isAdmin, isMuted: false , mutedUntil:null});
     	return await this.memberRepository.save(member);
    }

    async getMembers(channelId: number): Promise<any> {
	
    	return await this.userRepository
			.createQueryBuilder("user")
			.leftJoin("user.members", "member")
			.select([
				'user.id',
				'user.username',
				'member.isAdmin',
				'member.isOwner' ])
			.where('member.channelId = :channelId', { channelId })
			.orderBy("member.id", "ASC")
			.getMany();
    }

    async kickMember(adminId : number, kickId: number, channel: Channel) {
	
    	const admin = await this.findMember(channel.id, adminId);
    	const memberToKick = await this.findMember(channel.id, kickId);
    
		if (!admin || !memberToKick)
    	    throw new NotFoundException("user not a member of channel.");
      	if (!check_privileges(admin, memberToKick))
        	return false;

      	await this.memberRepository.remove(memberToKick);
		return true;
    }

    async banMember(adminId: number, banId: number, channel: Channel, user: User) {
    
		const admin = await this.findMember(channel.id, adminId);
    	const memberToBan = await this.findMember(channel.id, banId);
    
		if (!admin || !memberToBan)
			throw new NotFoundException("user not a member of channel.");
     	if (!check_privileges(admin, memberToBan))
        	return false;
      
		const bannedUser = this.bannedRepository.create({user, channel});

		await this.memberRepository.remove(memberToBan);
		await this.bannedRepository.save(bannedUser);
		return true;
    }

    async muteMember(adminId: number, banId: number, channel: Channel) {
	
    	const admin = await this.findMember(channel.id, adminId);
		const memberToMute = await this.findMember(channel.id, banId);
		
		if (!admin || !memberToMute)
			throw new NotFoundException("user not a member of channel.");
        if (!check_privileges(admin, memberToMute))
        	return false;

        const mutedUntil = new Date();
    	mutedUntil.setMinutes(mutedUntil.getMinutes() + 3);
      	memberToMute.isMuted = true;
      	memberToMute.mutedUntil = mutedUntil;
		
		await this.memberRepository.save(memberToMute);
		return true;
    }
    
    async setAdmin(ownerId: number, userToChangeId: number, channel: Channel) {
		
		const owner = await this.findMember(channel.id, ownerId);
		const userToChange = await this.findMember(channel.id, userToChangeId);

		if (!owner || !userToChange)
			throw new NotFoundException("user not a member of channel.");
		if (!check_privileges(owner, userToChange))
			return false;
		if (!owner.isOwner)
			return false;

		userToChange.isAdmin = !userToChange.isAdmin;
		await this.memberRepository.save(userToChange);

		return true;
    }

    async removeMember(channel: Channel, user: User) {

		const member = await this.findMember(channel.id, user.id);

		if (!member)
			throw new NotFoundException(`${user.username} is not a member of ${channel.name}`);
		if (member.isOwner) {
			const nextOwner = await this.getSecondMember(channel.id);
			if (!nextOwner) {
				return false;
			}
			else {
				nextOwner.isOwner = true;
				nextOwner.isAdmin = true;
				await this.memberRepository.remove(member);
				await this.memberRepository.save(nextOwner);
				return true;
			}
		}
		
		await this.memberRepository.remove(member);
		return true;
    }

    async unmuteMember(member: Member) {
	
        if (member) {
			member.isMuted = false;
			member.mutedUntil = null;
			
			await this.memberRepository.save(member);
        }
    }

    async findMutedMembers(): Promise<Member[]> {

		return this.memberRepository.find({
			where: {
				isMuted: true,
				mutedUntil: LessThan(new Date()),
			}
		});
    }

    @Cron(CronExpression.EVERY_MINUTE, {name: 'auto_unmute'})
    async handleMuteStatus() {
		const mutedMembers = await this.findMutedMembers();
		
		for (const member of mutedMembers) {
			if (member.mutedUntil <= new Date()) {
				await this.unmuteMember(member);
			}
		}
    }

    async findMember(channelId: number, userId: number): Promise<Member> {
		if (channelId == null || userId == null)
			return null;

		return this.memberRepository
			.findOne({      
				where: {
					channel: { id: channelId },
					user: { id: userId }
				}
			});
    }

    async findBannedMember(channelId: number, userId: number): Promise<Banned> {
		if (channelId == null || userId == null)
			return null;

		return this.bannedRepository
			.findOne({      
				where: {
					channel: { id: channelId },
					user: { id: userId }
				}
			});
    }
    
    async getSecondMember(channelId:number): Promise<Member> {
		const allMembers = await this.memberRepository
			.createQueryBuilder('member')
			.where('member.channel.id = :channelId', { channelId })
			.orderBy('member.id', 'ASC')
			.getMany();
		
		if (allMembers.length < 2)
			return null;
		return allMembers[1];
    }
}