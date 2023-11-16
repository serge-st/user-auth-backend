import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { usernameRegex } from 'src/users/dto/create-user.dto';

export class AuthCredentialsDto {
  @IsString()
  @IsOptional()
  @Matches(usernameRegex, {
    message: `username must contain only letters, numbers, and underscores, and should not start or end with an underscore.`,
  })
  username?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
