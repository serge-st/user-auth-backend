import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UtilsService } from 'src/utils/utils.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly utilsService: UtilsService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(username: string, email: string, password: string): Promise<any> {
    console.log(this.configService.get<string>('JWT_SECRET'));
    const user = await this.usersService.getByUsernameOrEmail(username, email);
    const isPasswordValid = await this.utilsService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Please check you login credentials');
    }
    // TODO: create a jwt payload schema
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '60s',
      }),
    };
  }
}
