import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { ReqProduct } from './product.config';
import { CategoryService } from 'src/category/category.service';
import { StoreService } from 'src/store/store.service';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  OmitType,
  PartialType,
} from '@nestjs/swagger';

export class ListProductControllerResponseDTO {
  @ApiProperty({ type: [Product] })
  products!: Product[];
}

export class GetProductControllerResponseDTO {
  @ApiProperty({ type: Product })
  product!: Product;
}

export class CreateProductControllerBodyDTO extends OmitType(Product, [
  'id',
  'created_at',
  'updated_at',
] as const) {}

export class UpdateProductControllerBodyDTO extends PartialType(
  OmitType(Product, ['id', 'created_at', 'updated_at'] as const),
) {}

const tags = ['Produtos'];

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/products')
  @ApiOperation({ summary: 'Listagem de Produtos', tags })
  @ApiResponse({ type: ListProductControllerResponseDTO })
  async find(): Promise<ListProductControllerResponseDTO> {
    const { products } = await this.productService.find({
      where: {},
    });
    return { products };
  }

  @Get('/v1/products/:id')
  @ApiResponse({ type: GetProductControllerResponseDTO })
  @ApiOperation({ summary: 'Detalhes de um Produto por ID', tags })
  get(@ReqProduct() product: Product): GetProductControllerResponseDTO {
    return { product };
  }

  @Post('/v1/products')
  @ApiResponse({ type: GetProductControllerResponseDTO })
  @ApiOperation({ summary: 'Criação de Produto', tags })
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

  @Put('/v1/products/:id')
  @ApiResponse({ type: GetProductControllerResponseDTO })
  @ApiOperation({ summary: 'Atualização de Produto', tags })
  async update(
    @Body() body: UpdateProductControllerBodyDTO,
    @ReqProduct() product: Product,
  ): Promise<GetProductControllerResponseDTO> {
    const { product: updatedProduct } = await this.productService.update({
      data: body,
      product,
    });

    return { product: updatedProduct };
  }

  @Delete('/v1/products/:id')
  @ApiOperation({ summary: 'Deletar Produto', tags })
  async delete(@ReqProduct() product: Product): Promise<void> {
    await this.productService.delete({ product });
  }
}
