import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {

  @ApiProperty({
      example: 'farha@example.com',
    })
  @IsEmail()
  email!: string;

  @ApiProperty({
      
  })
  @MinLength(6)
  password!: string;
}