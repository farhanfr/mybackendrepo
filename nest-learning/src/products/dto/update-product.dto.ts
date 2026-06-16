import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  price!: number;
}