import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
}
