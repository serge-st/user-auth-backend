import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from 'users/dto/create-user.dto';

export class AuthCredentialsDto extends PartialType(OmitType(CreateUserDto, ['name'] as const)) {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
