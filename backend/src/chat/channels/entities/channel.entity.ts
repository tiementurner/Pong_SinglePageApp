import {
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	Index } from "typeorm";
import { Member } from "src/chat/members/entities/member.entity";
import { Message } from "src/chat/messages/entities/message.entity";

@Entity()
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@Index({unique: true})
	name: string;

	@Column({ default: false })
	isPrivate: boolean;

	@Column({ nullable: true })
	password?: string;

	@Column({default: false})
	isDM: boolean;

	@OneToMany(() => Member, member => member.channel, {cascade: true})
	members: Member[];

	@OneToMany(() => Message, message => message.channel, {cascade: true})
	messages: Message[];
}