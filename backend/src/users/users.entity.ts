import { BlockList } from 'src/chat/blockedlist.entity';
import { Member } from 'src/chat/members/entities/member.entity';
import { Friend } from 'src/friends/entities/friend.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Entity, Column, PrimaryColumn, OneToMany, ManyToMany, JoinTable, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'user_info'})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({unique: true})
  username: string;

  @Column({nullable:true})
  password: string;

  @Column()
  email: string;

  @Column({default: "default.png"})
  image: string;

  @Column({default: false})
  is2FAenabled: boolean;

  @Column({nullable: true})
  twofaAuthenticationSecret?: string;
  
  @Column({ default: 0 })
  score: number;

  @OneToMany(() => Notification, notification => notification.receiver)
  notifications: Notification[]

  @OneToMany(() => Member, member => member.user)
  members: Member[];

  @ManyToMany(() => BlockList)
  @JoinTable()
  blockedUsers: BlockList[];

  @ManyToMany(() => BlockList)
  @JoinTable()
  blockedByUsers: BlockList[];

  @OneToMany(() => Friend, friend => (friend.receiver))
  friends1: Friend[];

  @OneToMany(() => Friend, friend => (friend.sender))
  friends2: Friend[];
}
