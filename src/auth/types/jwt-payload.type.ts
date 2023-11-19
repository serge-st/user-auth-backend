import { User } from 'src/users/entities/user.entity';

export type JWTPayload = {
  sub: User['id'];
  username: User['username'];
};
