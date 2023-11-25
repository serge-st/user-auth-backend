import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { Token } from './entities/token.entity';
import { UtilsModule } from 'utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([Token]), UtilsModule, ConfigModule, JwtModule.register({}), UtilsModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
