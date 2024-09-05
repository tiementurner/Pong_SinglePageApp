import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	Index } from 'typeorm';
import { User } from 'src/users/users.entity';

@Entity()
export class BlockList {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.blockedUsers, {onDelete: 'CASCADE'})
	@Index()
	blocker: User;

	@ManyToOne(() => User, user => user.blockedByUsers, {onDelete: 'CASCADE'})
	@Index()
	blocked: User;
}