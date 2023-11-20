import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UtilsService } from 'src/utils/utils.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTPayload } from './types/jwt-payload.type';
import { SignInResponse } from './types/singin-response.type';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
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

  async signUp(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    const activationLink = this.utilsService.getUUID();
    // TODO: Should I save activationLink to the users table?
    await this.mailService.sendActivationLink(newUser.email, activationLink);
    return 'signUp';
  }

  async signIn(username: string, email: string, password: string): Promise<SignInResponse> {
    try {
      const user = await this.usersService.getByUsernameOrEmail(username, email);
      const isPasswordValid = await this.utilsService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Please check you login credentials');
      }

      const payload: JWTPayload = { sub: user.id, username: user.username };
      return await this.generateTokens(payload);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Please check your login credentials');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
