import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class UtilsService {
  constructor(private readonly configService: ConfigService) {}
  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS'));
      const salt = await bcrypt.genSalt(saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  getDBConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      username: this.configService.get<string>('database.user'),
      password: this.configService.get<string>('database.password'),
      database: this.configService.get<string>('database.database'),
      autoLoadEntities: true,
      logging: true,
      synchronize: this.configService.get<string>('mode') === 'development',
      ssl: this.configService.get<string>('mode') === 'production',
    };
  }
}
