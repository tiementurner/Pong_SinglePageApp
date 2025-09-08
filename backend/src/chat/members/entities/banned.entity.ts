import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne } from 'typeorm';
import { User } from 'src/users/users.entity';
import { Channel } from '../../channels/entities/channel.entity';

@Entity()
export class Banned {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, {onDelete: 'CASCADE'})
    user: User;

    @ManyToOne(() => Channel, {onDelete: 'CASCADE'})
    channel: Channel;
}