import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [UsersModule, UtilsModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
