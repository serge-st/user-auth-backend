import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from '../config/configuration';
import { UsersModule } from 'users/users.module';
import { UtilsModule } from 'utils/utils.module';
import { UtilsService } from 'utils/utils.service';
import { AuthModule } from 'auth/auth.module';
import { MailModule } from 'mail/mail.module';
import { TokensModule } from 'tokens/tokens.module';

@Module({
  imports: [
    JwtModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [UtilsModule],
      inject: [UtilsService],
      useFactory: (utilsService: UtilsService) => {
        return utilsService.getDBConfig();
      },
    }),
    UsersModule,
    UtilsModule,
    AuthModule,
    MailModule,
    TokensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
