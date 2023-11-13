import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User]), UtilsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
