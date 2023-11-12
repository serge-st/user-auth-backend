import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PasswordUtils } from './utils/password.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    // TODO: fix this
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS'));
    const hashedPassword = await PasswordUtils.hashPassword(password, saltRounds);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    try {
      await this.usersRepository.save(newUser);
    } catch (error) {
      const { code, detail } = error;
      if (code === '23505') {
        throw new ConflictException(detail);
      } else {
        throw new InternalServerErrorException();
      }
    }
    delete newUser.password;
    return newUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
