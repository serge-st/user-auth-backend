import { AuthGuard } from '@nestjs/passport';

export class RefreshTokenGuard extends AuthGuard('RefreshToken') {
  constructor() {
    super();
  }
}
