import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './strategies';
import { RefreshTokenStrategy } from './strategies';
import { UsersModule } from 'users/users.module';
import { UtilsModule } from 'utils/utils.module';
import { MailModule } from 'mail/mail.module';
import { TokensModule } from 'tokens/tokens.module';

@Module({
  imports: [UsersModule, UtilsModule, ConfigModule, JwtModule.register({}), MailModule, TokensModule],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
