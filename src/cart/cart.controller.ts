import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Cart, CartProduct } from './cart.entity';
import { CartGuard, ReqCart, ReqCartProduct } from './cart.config';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';
import { CartService } from './cart.service';
import { StoreService } from 'src/store/store.service';
import { ProductService } from 'src/product/product.service';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class GetMeCartControllerQueryDTO {
  @IsString()
  @ApiProperty({
    description: 'ID da loja',
    example: randomUUID(),
  })
  store_id!: string;
}

export class GetCartControllerResponseDTO {
  @ApiProperty({ type: Cart })
  cart!: Cart;
}

export class AddProductCartControllerBodyDTO {
  @IsString()
  @ApiProperty({
    description: 'ID do produto',
    example: randomUUID(),
  })
  product_id!: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 1,
  })
  @IsNumber()
  quantity!: number;
}

export class UpdateProductCartControllerBodyDTO {
  @IsNumber()
  @ApiProperty({
    description: 'Quantidade do produto',
    example: 1,
  })
  quantity!: number;
}

const tags = ['Carrinho'];

@Controller()
@UseGuards(CartGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly storeService: StoreService,
    private readonly productService: ProductService,
  ) {}

  @Get('/v1/carts/me')
  @ApiOperation({ summary: 'Carrinho do Usuário', tags })
  @ApiResponse({ type: GetCartControllerResponseDTO })
  async getMe(
    @LoggedUser() user: User,
    @Query() query: GetMeCartControllerQueryDTO,
  ): Promise<GetCartControllerResponseDTO> {
    const { store } = await this.storeService.get({
      where: { id: query.store_id },
      options: { throwIfNotFound: true },
    });

    const { cart } = await this.cartService.getOrCreate({
      get: { where: { user_id: user.id, store_id: store.id } },
      create: { store, user },
    });

    return { cart };
  }

  @Get('/v1/carts/:id')
  @ApiOperation({ summary: 'Detalhes do Carrinho por ID', tags })
  @ApiResponse({ type: GetCartControllerResponseDTO })
  get(@ReqCart() cart: Cart): GetCartControllerResponseDTO {
    return { cart };
  }

  @Post('/v1/carts/:id/products')
  @ApiOperation({ summary: 'Adicionar Produto ao Carrinho', tags })
  @ApiResponse({ type: GetCartControllerResponseDTO })
  async addProduct(
    @ReqCart() cart: Cart,
    @Body() body: AddProductCartControllerBodyDTO,
  ): Promise<GetCartControllerResponseDTO> {
    const { product } = await this.productService.get({
      where: { id: body.product_id, store_id: cart.store_id },
      options: { throwIfNotFound: true },
    });

    await this.cartService.addProduct({
      cart,
      product,
      data: body,
    });

    const { cart: updatedCart } = await this.cartService.get({
      where: { id: cart.id },
      options: { throwIfNotFound: true },
    });

    return { cart: updatedCart };
  }

  @Put('/v1/carts/:id/products/:cart_product_id')
  @ApiOperation({ summary: 'Atualizar Produto do Carrinho', tags })
  @ApiResponse({ type: GetCartControllerResponseDTO })
  async updateProduct(
    @ReqCart() cart: Cart,
    @ReqCartProduct() cartProduct: CartProduct,
    @Body() body: UpdateProductCartControllerBodyDTO,
  ): Promise<GetCartControllerResponseDTO> {
    await this.cartService.updateProduct({
      cart,
      cartProduct,
      data: body,
    });

    const { cart: updatedCart } = await this.cartService.get({
      where: { id: cart.id },
      options: { throwIfNotFound: true },
    });

    return { cart: updatedCart };
  }

  @Delete('/v1/carts/:id/products/:cart_product_id')
  @ApiOperation({ summary: 'Remover Produto do Carrinho', tags })
  @ApiResponse({ type: GetCartControllerResponseDTO })
  async deleteProduct(
    @ReqCart() cart: Cart,
    @ReqCartProduct() cartProduct: CartProduct,
  ): Promise<GetCartControllerResponseDTO> {
    await this.cartService.deleteProduct({
      cart,
      cartProduct,
    });

    const { cart: updatedCart } = await this.cartService.get({
      where: { id: cart.id },
      options: { throwIfNotFound: true },
    });

    return { cart: updatedCart };
  }
}
