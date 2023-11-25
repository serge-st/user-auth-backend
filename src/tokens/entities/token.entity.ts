import { User } from 'users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, Unique, OneToOne } from 'typeorm';

@Entity({ name: 'tokens' })
@Unique(['userId'])
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'refresh_token' })
  refreshToken: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  userId: User['id'];
}
