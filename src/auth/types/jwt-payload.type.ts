import { User } from 'users/entities/user.entity';

export type JWTPayload = {
  sub: User['id'];
  username: User['username'];
};
