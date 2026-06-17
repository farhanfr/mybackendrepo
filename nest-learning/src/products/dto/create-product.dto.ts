import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'Laptop Gaming',
        description: 'Nama produk',
    })
    name!: string;

    @IsNumber()
    @ApiProperty({
        example: 15000000,
        description: 'Harga produk',
    })
    price!: number;
}