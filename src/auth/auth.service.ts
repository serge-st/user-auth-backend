import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'users/users.service';
import { UtilsService } from 'utils/utils.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTPayload } from './types/jwt-payload.type';
import { SignInResponse } from './types/singin-response.type';
import { CreateUserDto } from 'users/dto/create-user.dto';
import { MailService } from 'mail/mail.service';
import { User } from 'users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly utilsService: UtilsService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(userInfo: User): Promise<SignInResponse> {
    const payload: JWTPayload = { sub: userInfo.id, username: userInfo.username };
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

  async signUp(createUserDto: CreateUserDto): Promise<SignInResponse> {
    const newUser = await this.usersService.create(createUserDto);
    const activationLink = this.utilsService.getUUID();
    // TODO: Should I save activationLink to the users table?
    await this.mailService.sendActivationLink(newUser.email, activationLink);
    return await this.generateTokens(newUser);
  }

  async signIn(username: string, email: string, password: string): Promise<SignInResponse> {
    try {
      const user = await this.usersService.getByUsernameOrEmail(username, email);
      const isPasswordValid = await this.utilsService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Please check you login credentials');
      }

      return await this.generateTokens(user);
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
