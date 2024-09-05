import { User } from "src/users/users.entity";
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
    friendid: number;

    @Column({default: false})
    accepted: boolean

    @ManyToOne(() => User, {onDelete: 'CASCADE'})
    @Index()
    sender: User;

    @ManyToOne(() => User, {onDelete: 'CASCADE'})
    @Index()
    receiver: User;
}
