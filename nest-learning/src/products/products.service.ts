import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {

  private products = [
    {
      id: 1,
      name: 'Laptop',
      price: 15000000,
    },
    {
      id: 2,
      name: 'Mouse',
      price: 150000,
    },
  ];

  findAll() {
    return this.products;
  }

  findOne(id: number) {
    const product = this.products.find(
      (product) => product.id === id,
    );

    if (!product) {
      throw new NotFoundException(`Product dengan ID ${id} tidak ditemukan`,);
    }

    return product;
  }

  create(dto: CreateProductDto) {
    const newProduct = {
      id: this.products.length + 1,
      ...dto,
    };

    this.products.push(newProduct);

    return newProduct;
  }

  update(
    id: number,
    dto: UpdateProductDto,
  ) {
    const product = this.products.find(
      (product) => product.id === id,
    );

    if (!product) {
      throw new NotFoundException(
        `Product dengan ID ${id} tidak ditemukan`,
      );
    }

    product.name = dto.name;
    product.price = dto.price;

    return product;
  }

  remove(id: number) {
    const index = this.products.findIndex(
      (product) => product.id === id,
    );

    if (index === -1) {
      throw new NotFoundException(
        `Product dengan ID ${id} tidak ditemukan`,
      );
    }

    const deleted = this.products[index];

    this.products.splice(index, 1);

    return deleted;
  }

}
