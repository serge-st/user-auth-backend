import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UtilsService {
  constructor(private readonly configService: ConfigService) {}

  async hashData(data: string): Promise<string> {
    try {
      const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS'));
      const salt = await bcrypt.genSalt(saltRounds);
      return await bcrypt.hash(data, salt);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async compareHash(inputString: string, hashedString: string): Promise<boolean> {
    return await bcrypt.compare(inputString, hashedString);
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

  getUUID(): string {
    return uuidv4();
  }
}
