import { User } from 'users/entities';
import { TokenResponse } from 'tokens/types/token-response.type';

export type SignInResponse = TokenResponse & {
  user: User;
};
