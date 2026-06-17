import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {

  constructor(
    private readonly prisma: PrismaService
  ) { }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {

    const product = await this.prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
      
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    // const newProduct = {
    //   ...dto,
    // };

    return this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price
      }
    });


  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

}
