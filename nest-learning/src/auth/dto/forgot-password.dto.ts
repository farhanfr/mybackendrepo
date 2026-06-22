import { ApiProperty }
  from '@nestjs/swagger';

import { IsEmail }
  from 'class-validator';

export class ForgotPasswordDto {

  @ApiProperty({
    example:
      'farha@example.com',
  })
  @IsEmail()
  email!: string;
}