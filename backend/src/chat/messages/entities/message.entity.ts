import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	Index } from 'typeorm';

import { User } from 'src/users/users.entity';
import { Channel } from '../../channels/entities/channel.entity';

@Entity({name: "messages"})
export class Message {
	@PrimaryGeneratedColumn()
	message_id: number;

	@ManyToOne(() => Channel, {nullable: false, onDelete: 'CASCADE'})
	@Index()
	channel: Channel

	@ManyToOne(() => User, {nullable: false, onDelete: 'CASCADE'})
	user: User;

	@Column()
	message_text: string;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	timestamp: string;
}