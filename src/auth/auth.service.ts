import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly utilsService: UtilsService,
  ) {}

  async signIn(username: string, email: string, password: string): Promise<any> {
    const user = await this.usersService.getByUsernameOrEmail(username, email);
    console.log(user);
    const isPasswordValid = await this.utilsService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    return 'great success';
  }
}
