import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { createZodDto } from 'nestjs-zod';
import { Product, ProductSchema } from './product.entity';
import { z } from 'zod';
import { ReqProduct } from './product.config';
import { CategoryService } from 'src/category/category.service';
import { StoreService } from 'src/store/store.service';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';

export const ListProductControllerResponseSchema = z.object({
  products: z.array(ProductSchema),
});

export class ListProductControllerResponseDTO extends createZodDto(
  ListProductControllerResponseSchema,
) {}

export const GetProductControllerResponseSchema = z.object({
  product: ProductSchema,
});

export class GetProductControllerResponseDTO extends createZodDto(
  GetProductControllerResponseSchema,
) {}

export const CreateProductControllerBodySchema = z.object({
  title: z.string(),
  image_url: z.string(),
  price: z.number(),
  category_id: z.string(),
  store_id: z.string(),
});

export class CreateProductControllerBodyDTO extends createZodDto(
  CreateProductControllerBodySchema,
) {}

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/products')
  async find(): Promise<ListProductControllerResponseDTO> {
    const { products } = await this.productService.find({
      where: {},
    });
    return { products };
  }

  @Get('/v1/products/:id')
  get(@ReqProduct() product: Product): GetProductControllerResponseDTO {
    return { product };
  }

  @Post('/v1/products')
  async create(
    @Body() body: CreateProductControllerBodyDTO,
    @LoggedUser() user: User,
  ): Promise<GetProductControllerResponseDTO> {
    const { store } = await this.storeService.get({
      where: { id: body.store_id },
      options: { throwIfNotFound: true },
    });

    if (store.owner_user_id !== user.id) throw new ForbiddenException();

    const { category } = await this.categoryService.get({
      where: { id: body.category_id, store_id: body.store_id },
      options: { throwIfNotFound: true },
    });

    const { product } = await this.productService.create({
      data: body,
      category,
      store,
    });

    return { product };
  }
}
