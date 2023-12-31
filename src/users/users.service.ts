import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UtilsService } from 'utils/utils.service';
import { TokensService } from 'tokens/tokens.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly utilsService: UtilsService,
    private readonly tokensService: TokensService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const hashedPassword = await this.utilsService.hashPassword(password);
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
    return newUser;
  }

  async getAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async getById(id: number): Promise<User> {
    const [user] = await this.usersRepository.find({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} was not found`);
    }
    return user;
  }

  async getByUsernameOrEmail(username: string = '', email: string = ''): Promise<User> {
    if (!username && !email) {
      throw new BadRequestException('Either username or email must be provided');
    }

    if (username) {
      const userByUsername = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.username = :username', { username })
        .getOne();

      if (userByUsername) return userByUsername;
    }

    if (email) {
      const userByEmail = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .getOne();

      if (userByEmail) return userByEmail;
    }

    throw new NotFoundException('User was not found');
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getById(id);
    const { password } = updateUserDto;
    if (password) {
      const hashedPassword = await this.utilsService.hashPassword(password);
      updateUserDto.password = hashedPassword;
    }
    const updatedUser = this.usersRepository.create({ id, ...updateUserDto });
    try {
      await this.usersRepository.save(updatedUser);
      return Object.assign(user, updatedUser);
    } catch (error) {
      const { code, detail } = error;
      if (code === '23505') {
        throw new ConflictException(detail);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async remove(id: number): Promise<void> {
    await this.tokensService.deleteRefreshToken(id);
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} was not found`);
    }
  }
}
