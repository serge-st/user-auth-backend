import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { UtilsModule } from 'utils/utils.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Token]), UtilsModule, ConfigModule, JwtModule.register({}), UtilsModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
