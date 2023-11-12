import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';

export class PasswordUtils {
  static async hashPassword(password: string, saltRounds: number): Promise<string> {
    try {
      console.log('salt:', saltRounds);
      const salt = await bcrypt.genSalt(saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
