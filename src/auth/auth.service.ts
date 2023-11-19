import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UtilsService } from 'src/utils/utils.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTPayload } from './types/jwt-payload.type';
import { SignInResponse } from './types/singin-response.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly utilsService: UtilsService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JWTPayload): Promise<SignInResponse> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: 60 * 15,
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: 60 * 60 * 24 * 30,
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }),
    ]);
    return {
      access_token,
      refresh_token,
    };
  }

  async signIn(username: string, email: string, password: string): Promise<SignInResponse> {
    const user = await this.usersService.getByUsernameOrEmail(username, email);
    const isPasswordValid = await this.utilsService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Please check you login credentials');
    }

    const payload: JWTPayload = { sub: user.id, username: user.username };
    return await this.generateTokens(payload);
  }
}
