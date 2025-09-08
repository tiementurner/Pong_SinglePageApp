import { Injectable} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';

@Injectable()
export class NotificationService {
  constructor(
	@InjectRepository(Notification)
	  private readonly notifRepository: Repository<Notification>,
      private readonly userService: UsersService
  ) {}

  async findByNotifId(notifId: number): Promise<Notification> {

	const notification = await this.notifRepository
	.findOne({
		where: {
			id: notifId
		}
	});
	return notification;
  }

  async getById(userId: number) : Promise<Notification[]> {
	const notifications: Notification[] = await this.notifRepository
		.createQueryBuilder('notification')
		.innerJoin('notification.receiver', 'receiver')
		.innerJoin('notification.sender', 'sender')
		.where('notification.receiver.id = :userId', { userId: userId })
		.select([
			'notification.id',
			'sender.id',
			'sender.username',
			'notification.feature',
			'notification.type',
			'notification.accepted',
			'notification.type_id'
		])
		.getMany();
	return notifications;
  }

  async create(sender: User, receiver: User, feature: ("friend" | "game" | "dm"), type: ("request" | "response"), accepted: boolean, type_id?: number): Promise<Notification> {

	const createNotificationDto: CreateNotificationDto = {
		sender: sender,
		receiver: receiver,
		feature: feature,
		type: type,
		accepted: accepted,
		type_id: type_id || -1
	}

	const newNotification = this.notifRepository.create({...createNotificationDto})
	const savedNotification = await this.notifRepository.save(newNotification);

	return savedNotification;
  }

  async remove(notificationId: number) {
	const notification = await this.findByNotifId(notificationId);
	if (notification == null)
		return;
	await this.notifRepository.remove(notification);
	return;
  }
}