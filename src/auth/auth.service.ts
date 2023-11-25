import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'users/users.service';
import { UtilsService } from 'utils/utils.service';
import { SignInResponse } from './types/singin-response.type';
import { CreateUserDto } from 'users/dto/create-user.dto';
import { MailService } from 'mail/mail.service';
import { TokensService } from 'tokens/tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly utilsService: UtilsService,
    private readonly tokensService: TokensService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<SignInResponse> {
    const newUser = await this.usersService.create(createUserDto);
    const activationLink = this.utilsService.getUUID();
    // TODO: Should I save activationLink to the users table?
    await this.mailService.sendActivationLink(newUser.email, activationLink);
    const tokens = await this.tokensService.generateTokens(newUser);
    await this.tokensService.saveRefreshToken(newUser.id, tokens.refresh_token);
    return tokens;
  }

  async signIn(username: string, email: string, password: string): Promise<SignInResponse> {
    try {
      const user = await this.usersService.getByUsernameOrEmail(username, email);
      const isPasswordValid = await this.utilsService.compareHash(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Please check you login credentials');
      }

      const tokens = await this.tokensService.generateTokens(user);
      console.log('tokens', tokens);
      await this.tokensService.saveRefreshToken(user.id, tokens.refresh_token);
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

  async refresh(userId: number, refreshToken: string): Promise<SignInResponse> {
    const tokenWithUserDetails = await this.tokensService.getTokenWithUser(userId);
    if (!tokenWithUserDetails) throw new UnauthorizedException();

    const { refreshToken: hashedRefreshToken, userDetails } = tokenWithUserDetails;
    const isTokenMatching = await this.utilsService.compareHash(refreshToken, hashedRefreshToken);
    if (!isTokenMatching) throw new ForbiddenException();
    const tokens = await this.tokensService.generateTokens(userDetails);
    await this.tokensService.saveRefreshToken(userId, tokens.refresh_token);
    return tokens;
  }

  async signOut(id: number): Promise<void> {
    this.tokensService.deleteRefreshToken(id);
  }
}
