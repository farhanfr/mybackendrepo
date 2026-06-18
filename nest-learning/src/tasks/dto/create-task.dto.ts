import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Belajar Prisma Relation',
    description: 'Judul task',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Mempelajari relasi User dan Task',
    description: 'Deskripsi task',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}