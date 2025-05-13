import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { createZodDto } from 'nestjs-zod';
import { Cart, CartProduct, CartSchema } from './cart.entity';
import { z } from 'zod';
import { ReqCart, ReqCartProduct } from './cart.config';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';
import { CartService } from './cart.service';
import { StoreService } from 'src/store/store.service';
import { ProductService } from 'src/product/product.service';
import { ApiOperation } from '@nestjs/swagger';

export const GetMeCartControllerQuerySchema = z.object({
  store_id: z.string(),
});

export class GetMeCartControllerQueryDTO extends createZodDto(
  GetMeCartControllerQuerySchema,
) {}

export const GetCartControllerResponseSchema = z.object({
  cart: CartSchema,
});

export class GetCartControllerResponseDTO extends createZodDto(
  GetCartControllerResponseSchema,
) {}

export const CreateCartControllerBodySchema = z.object({
  code: z.string(),
  discount: z.number(),
  store_id: z.string(),
});

export class CreateCartControllerBodyDTO extends createZodDto(
  CreateCartControllerBodySchema,
) {}

export const AddProductCartControllerBodySchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
});

export class AddProductCartControllerBodyDTO extends createZodDto(
  AddProductCartControllerBodySchema,
) {}

export const UpdateProductCartControllerBodySchema = z.object({
  quantity: z.number(),
});

export class UpdateProductCartControllerBodyDTO extends createZodDto(
  UpdateProductCartControllerBodySchema,
) {}

const tags = ['Carrinho'];

@Controller()
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly storeService: StoreService,
    private readonly productService: ProductService,
  ) {}

  @Get('/v1/carts/me')
  @ApiOperation({ summary: 'Carrinho do Usuário', tags })
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
  get(@ReqCart() cart: Cart): GetCartControllerResponseDTO {
    return { cart };
  }

  @Post('/v1/carts/:id/products')
  @ApiOperation({ summary: 'Adicionar Produto ao Carrinho', tags })
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
