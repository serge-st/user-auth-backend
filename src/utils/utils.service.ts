import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as sha256 from 'crypto-js/sha256';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UtilsService {
  constructor(private readonly configService: ConfigService) {}

  async hashPassword(data: string): Promise<string> {
    try {
      const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS'));
      const salt = await bcrypt.genSalt(saltRounds);
      return await bcrypt.hash(data, salt);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async comparePassword(inputString: string, hashedString: string): Promise<boolean> {
    return await bcrypt.compare(inputString, hashedString);
  }

  hashDataSHA256(data: string): string {
    const result = sha256(data).toString();
    console.log('UtilsService hashData256 result', result);
    return sha256(data).toString();
  }

  compareDataSHA256(data: string, hash: string): boolean {
    return sha256(data).toString() === hash;
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
