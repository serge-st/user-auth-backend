import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UtilsService } from 'src/utils/utils.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly utilsService: UtilsService,
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

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async getById(id: number): Promise<User> {
    const [user] = await this.usersRepository.find({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} was not found`);
    }
    return user;
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
        console.log('error', code);
        throw new ConflictException(detail);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} was not found`);
    }
  }
}
