import { User } from 'src/users/users.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index } from 'typeorm';

@Entity({name: 'game_history'})
export class GameHistory {
  @PrimaryGeneratedColumn()
  gameid: number;

  @CreateDateColumn({type: 'timestamptz'})
  timestamp: Date;

  @Column()
  gametype: number;
  
  @Column({ default: 0 })
  won: number;

  @Column({ default: 0 })
  lost: number;

  @ManyToOne(user_info => User, {cascade: true, onDelete: 'SET NULL', nullable: true})
  @Index()
  playerA: User;

  @ManyToOne(user_info => User, {cascade: true, onDelete: 'SET NULL', nullable: true})
  @Index()
  playerB: User;
}
