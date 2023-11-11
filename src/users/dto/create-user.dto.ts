import { IsNotEmpty, IsBoolean, IsString, IsEmail, IsOptional, Matches, Length } from 'class-validator';

const usernameRegex = /^(?=.*$)(?![_])[a-zA-Z0-9_]+(?<![_])$/;
const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export class CreateUserDto {
  @Length(2, 20)
  @IsString()
  @Matches(usernameRegex, {
    message: `username must contain only letters, numbers, and underscores, and should not start or end with an underscore.`,
  })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  @Matches(passwordRegex, {
    message: `The password is too weak. The password should contain at least 1 upper case letter, 1 lower case letter, 1 number or special character`,
  })
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @Length(0, 50)
  name?: string;
}
