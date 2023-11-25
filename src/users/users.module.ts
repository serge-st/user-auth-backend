import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UtilsModule } from 'utils/utils.module';
import { TokensModule } from 'tokens/tokens.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UtilsModule, TokensModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
