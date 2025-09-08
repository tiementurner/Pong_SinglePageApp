import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	Column,
	Index } from 'typeorm';
import { User } from 'src/users/users.entity';
import { Channel } from '../../channels/entities/channel.entity';

@Entity()
export class Member {
	
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, {onDelete: 'CASCADE'})
	@Index()
	user: User;

	@ManyToOne(() => Channel, channel => channel.members, {onDelete: 'CASCADE'})
	@Index()
	channel: Channel;

	@Column()
	isOwner: boolean;

	@Column({default: false})
	isAdmin: boolean;

	@Column({default: false})
	isMuted: boolean;

	@Column({ nullable: true })
	mutedUntil: Date;
}
