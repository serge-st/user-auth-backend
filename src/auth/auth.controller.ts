import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUserData, Public } from './decorators';
import { AuthCredentialsDto } from './dto';
import { RefreshTokenGuard } from './guards';
import { CreateUserDto } from 'users/dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() authCredentialsDto: AuthCredentialsDto) {
    const { username, email, password } = authCredentialsDto;
    return this.authService.signIn(username, email, password);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  signOut(@GetUserData('sub') userId: number) {
    console.log('AuthController signOut id', userId);
    this.authService.signOut(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@GetUserData('sub') userId: number, @GetUserData('refreshToken') refreshToken: string) {
    return this.authService.refresh(userId, refreshToken);
  }
}
