import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { JWTPayload } from './types/jwt-payload.type';
import { TokenWithUserDetails } from './types/token-with-user-details.type';
import { TokenResponse } from './types/token-response.type';
import { UtilsService } from 'utils/utils.service';
import { User } from 'users/entities';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token) private readonly tokensRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly utilsService: UtilsService,
  ) {}

  async generateTokens(userInfo: User): Promise<TokenResponse> {
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

  async getTokenWithUser(userId: number): Promise<TokenWithUserDetails> {
    const result = await this.tokensRepository
      .createQueryBuilder('tokens')
      .innerJoinAndMapOne('tokens.userDetails', 'tokens.userId', 'user')
      .where('tokens.userId = :userId', { userId })
      .getOne();
    return result as undefined as TokenWithUserDetails;
  }

  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const tokenHash = this.utilsService.hashDataSHA256(refreshToken);
    await this.tokensRepository.upsert({ userId, refreshToken: tokenHash }, ['userId']);
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    await this.tokensRepository.delete({ userId });
  }
}
