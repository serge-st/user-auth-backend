import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from 'users/dto/create-user.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { GetUserData } from './decorators/get-user-data.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // TODO: return tokens and user object
  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() authCredentialsDto: AuthCredentialsDto) {
    const { username, email, password } = authCredentialsDto;
    return this.authService.signIn(username, email, password);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  signOut(@GetUserData('sub') userId: number) {
    console.log('AuthController signOut id', userId);
    this.authService.signOut(userId);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@GetUserData('sub') userId: number, @GetUserData('refreshToken') refreshToken: string) {
    return this.authService.refresh(userId, refreshToken);
  }
}
