import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { User } from 'src/users/users.entity';

@Entity({name: "notification"})
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE'})
  sender: User;

  @ManyToOne(() => User, {nullable: false, onDelete: 'CASCADE'})
  @Index()
  receiver: User;

  @Column({ nullable: false })
  feature: "friend" | "game" | "dm";

  @Column({ nullable: false })
  type: "request" | "response";

  @Column({ default: false })
  accepted: boolean;

  @Column({ nullable: true })
  type_id?: number;

}