import { Token } from 'tokens/entities/token.entity';
import { User } from 'users/entities/user.entity';

export type TokenWithUserDetails = Omit<Token, 'userId'> & {
  userDetails: User;
};
