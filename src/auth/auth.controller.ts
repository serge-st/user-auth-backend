import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() authCredentialsDto: AuthCredentialsDto) {
    const { username, email, password } = authCredentialsDto;
    return this.authService.signIn(username, email, password);
  }

  // TODO: screate singup endpoint

  // TODO: implement signOut -> delete token from DB
  @Post('logout')
  signOut() {
    // return this.authService.signOut();
  }
}
