import { AuthGuard } from '@nestjs/passport';

export class AccessTokenGuard extends AuthGuard('AccessToken') {
  constructor() {
    super();
  }
}
