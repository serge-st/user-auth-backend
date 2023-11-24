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
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly utilsService: UtilsService,
    private readonly configService: ConfigService,
    @InjectRepository(Token) private readonly tokensRepository: Repository<Token>,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<SignInResponse> {
    const newUser = await this.usersService.create(createUserDto);
    const activationLink = this.utilsService.getUUID();
    // TODO: Should I save activationLink to the users table?
    await this.mailService.sendActivationLink(newUser.email, activationLink);
    const tokens = await this.generateTokens(newUser);
    await this.saveRefreshToken(newUser.id, tokens.refresh_token);
    return tokens;
  }

  async signIn(username: string, email: string, password: string): Promise<SignInResponse> {
    try {
      const user = await this.usersService.getByUsernameOrEmail(username, email);
      const isPasswordValid = await this.utilsService.compareHash(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Please check you login credentials');
      }

      const tokens = await this.generateTokens(user);
      await this.saveRefreshToken(user.id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Please check your login credentials');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

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

  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const tokenHash = await this.utilsService.hashData(refreshToken);
    await this.tokensRepository.upsert({ userId, refreshToken: tokenHash }, ['userId']);
  }
}
