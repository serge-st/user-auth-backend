import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
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
