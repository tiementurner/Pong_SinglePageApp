import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from './entities/friend.entity';
import { Repository, Brackets } from 'typeorm';
import { User } from 'src/users/users.entity';

@Injectable()
export class FriendsService {

  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
  ) {}

  async makeFriendRequest(sender: User, receiver: User) {

    const result: Friend[] = await this.friendRepository.find({
		where: {
			sender: {id: sender.id},
			receiver: {id: receiver.id}
		}});
    const result2: Friend[] = await this.friendRepository.find({
		where: {sender: {id: sender.id},
		receiver: {id: receiver.id}
	}});
    if (result.length == 0 && result2.length == 0){
    //   const nInvite = {sender: {id: FriendRequestDto.senderId} as User, receiver: {id: FriendRequestDto.receiverId} as User};
    //   const invite = this.friendRepository.create({...nInvite});
		const invite = this.friendRepository.create({sender: sender, receiver:receiver})
	const friendRequest = await this.friendRepository.save(invite);
	  //console.log("friend request friends.service.ts: ", friendRequest);
	  return friendRequest;
    }
    else {
      return null;
    }
  }

//   //friends are labelled either sender or receiver, depending on who sent the initial invite
//   async findFriends(id: number): Promise<any> {
//     let ret: Friend[] = await this.friendRepository.createQueryBuilder("friendlist")
//     .select("friendlist.friendid")
//     .leftJoin("friendlist.sender",  "friend")
//     .addSelect(["friend.id", "friend.username"])
//     .where("friendlist.receiver = :id", {id})
//     .andWhere("friendlist.accepted = true")
//     .getMany()
//     let ret2: Friend[] = await this.friendRepository.createQueryBuilder("friendlist")
//     .select("friendlist.friendid")
//     .leftJoin("friendlist.receiver",  "friend")
//     .addSelect(["friend.id", "friend.username"])
//     .where("friendlist.sender = :id", {id})
//     .andWhere("friendlist.accepted = true")
//     .getMany()
//     return ret.concat(ret2);
//   }

  //friends are labelled either sender or receiver, depending on who sent the initial invite
  async findFriends(id: number): Promise<Friend[]> {
	const friends: Friend[] = await this.friendRepository
		.createQueryBuilder('friend')
		.innerJoin('friend.sender', 'sender')
		.innerJoin('friend.receiver', 'receiver')
		.where('friend.accepted = :accepted', {accepted: true})
		.andWhere(
			new Brackets((qb) => {
				qb.where('sender.id = :id', { id: id,})
				.orWhere('receiver.id = :id', {id: id})
			}),
		)
		.select(
			'sender.id',
			'receiver.id'
		)
		.getMany();
	return friends
  }
//return array of friend requests with user id and username of sender
async getRequests(id: number): Promise<any> {
    return await this.friendRepository.createQueryBuilder("request")
    .select("request.friendid")
    .leftJoin("request.sender",  "sender")
    .addSelect(["sender.id", "sender.username"])
    .where("request.receiver = :id", {id})
    .andWhere("request.accepted = false")
    .getMany()
}

  async accept(id: number) {
    return await this.friendRepository.update(id, {accepted: true});
  }

  async remove(id: number) {
    return await this.friendRepository.delete(id);
  }
}
