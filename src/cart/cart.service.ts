import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { Cart, CartProduct, CartStatus } from './cart.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import { Store } from 'src/store/store.entity';
import {
  drizzleCartColumns,
  drizzleCart,
  drizzleCartProduct,
} from 'src/app/drizzle/schemas/cart.drizzle.schema';
import { User } from 'src/user/user.entity';
import { Product } from 'src/product/product.entity';

export type GetCartServiceParamsDTO<Options extends GetServiceOptions> = {
  where: FindCartServiceParamsDTO['where'];
  options?: Options;
};

export type GetCartServiceResponseDTO<Options extends GetServiceOptions> = {
  cart: Options['throwIfNotFound'] extends true ? Cart : Cart | undefined;
};

export type FindCartServiceParamsDTO = {
  where: {
    id?: string;
    user_id?: string;
    store_id?: string;
    status?: CartStatus;
  };
};

export type FindCartServiceResponseDTO = {
  carts: Cart[];
};

export type CreateCartServiceParamsDTO = {
  store: Store;
  user: User;
};

export type CreateCartServiceResponseDTO = {
  cart: Cart;
};

export type GetCartProductServiceParamsDTO<Options extends GetServiceOptions> =
  {
    where: FindCartProductServiceParamsDTO['where'];
    options?: Options;
  };

export type GetCartProductServiceResponseDTO<
  Options extends GetServiceOptions,
> = {
  cartProduct: Options['throwIfNotFound'] extends true
    ? CartProduct
    : CartProduct | undefined;
};

export type FindCartProductServiceParamsDTO = {
  where: { id?: string };
};

export type FindCartProductServiceResponseDTO = {
  cartProducts: CartProduct[];
};

export type GetOrCreateCartServiceParamsDTO = {
  get: GetCartServiceParamsDTO<{ throwIfNotFound: false }>;
  create: CreateCartServiceParamsDTO;
};

export type GetOrCreateCartServiceResponseDTO = {
  cart: Cart;
  created: boolean;
};

export type AddProductCartServiceParamsDTO = {
  cart: Cart;
  product: Product;
  data: { quantity: number };
};

export type DeleteProductCartServiceParamsDTO = {
  cart: Cart;
  cartProduct: CartProduct;
};

export type UpdateProductCartServiceParamsDTO = {
  cart: Cart;
  cartProduct: CartProduct;
  data: { quantity: number };
};

@Injectable()
export class CartService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetCartServiceParamsDTO<Options>,
  ): Promise<GetCartServiceResponseDTO<Options>> {
    const { carts } = await this.find({ where: params.where });

    if (carts.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Cart not found`);

      return { cart: undefined } as GetCartServiceResponseDTO<Options>;
    }

    if (carts.length > 1) {
      throw new InternalServerErrorException(
        `More than one Cart found, expected only one`,
      );
    }

    const cart = carts[0];

    return { cart } as GetCartServiceResponseDTO<Options>;
  }

  async find(
    params: FindCartServiceParamsDTO,
  ): Promise<FindCartServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleCartColumns)
      .from(drizzleCart)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleCartColumns.id, params.where.id));
    }

    if (params.where.user_id) {
      wheres.push(eq(drizzleCartColumns.user_id, params.where.user_id));
    }

    if (params.where.store_id) {
      wheres.push(eq(drizzleCartColumns.store_id, params.where.store_id));
    }

    if (params.where.status) {
      wheres.push(eq(drizzleCartColumns.status, params.where.status));
    }

    dynamicQuery.where(and(...wheres));

    const cartsData = await dynamicQuery;

    const carts = cartsData.map((cartData): Cart => {
      return {
        id: cartData.id,
        store_id: cartData.store_id,
        user_id: cartData.user_id,
        status: cartData.status,
        delivery_address: cartData.delivery_address || undefined,
        payment_method_id: cartData.payment_method_id || undefined,
        shipping_id: cartData.shipping_id || undefined,
        coupon_id: cartData.coupon_id || undefined,
        created_at: cartData.created_at.toISOString(),
        updated_at: cartData.updated_at.toISOString(),
      };
    });

    return { carts };
  }

  async create(
    params: CreateCartServiceParamsDTO,
  ): Promise<CreateCartServiceResponseDTO> {
    const { store, user } = params;

    await this.checkCreateConstraints(params);

    const id = randomUUID();
    const now = new Date().toISOString();

    const cart: Cart = {
      id,
      user_id: user.id,
      store_id: store.id,
      status: 'open',
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleCart).values({
      ...cart,
      created_at: new Date(cart.created_at),
      updated_at: new Date(cart.updated_at),
    });

    return { cart };
  }

  async checkCreateConstraints(
    params: CreateCartServiceParamsDTO,
  ): Promise<void> {
    const { store, user } = params;

    const { cart } = await this.get({
      where: {
        user_id: user.id,
        store_id: store.id,
        status: 'open',
      },
    });

    if (cart)
      throw new BadRequestException(
        `User already has an open cart for this store`,
      );
  }

  async getOrCreate(
    params: GetOrCreateCartServiceParamsDTO,
  ): Promise<GetOrCreateCartServiceResponseDTO> {
    const { get, create } = params;

    const { cart } = await this.get({ where: get.where });

    if (cart) return { cart, created: false };

    const { cart: newCart } = await this.create(create);

    return { cart: newCart, created: true };
  }

  async getCartProduct<Options extends GetServiceOptions>(
    params: GetCartProductServiceParamsDTO<Options>,
  ): Promise<GetCartProductServiceResponseDTO<Options>> {
    const { cartProducts } = await this.findCartProduct({
      where: params.where,
    });

    if (cartProducts.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Cart product not found`);

      return {
        cartProduct: undefined,
      } as GetCartProductServiceResponseDTO<Options>;
    }

    if (cartProducts.length > 1) {
      throw new InternalServerErrorException(
        `More than one Cart product found, expected only one`,
      );
    }

    return {
      cartProduct: cartProducts[0],
    } as GetCartProductServiceResponseDTO<Options>;
  }

  async findCartProduct(
    params: FindCartProductServiceParamsDTO,
  ): Promise<FindCartProductServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select()
      .from(drizzleCartProduct)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleCartProduct.id, params.where.id));
    }

    dynamicQuery.where(and(...wheres));

    const cartProductsData = await dynamicQuery;

    const cartProducts = cartProductsData.map(
      (cartProductData): CartProduct => {
        return {
          id: cartProductData.id,
          cart_id: cartProductData.cart_id,
          product_id: cartProductData.product_id,
          quantity: cartProductData.quantity,
          created_at: cartProductData.created_at.toISOString(),
          updated_at: cartProductData.updated_at.toISOString(),
        };
      },
    );

    return { cartProducts };
  }

  async addProduct(params: AddProductCartServiceParamsDTO): Promise<void> {
    const { cart, product, data } = params;
    if (cart.status !== 'open') {
      throw new BadRequestException('Cart is not open');
    }

    if (data.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const now = new Date().toISOString();

    const cartProduct: CartProduct = {
      id: randomUUID(),
      cart_id: cart.id,
      product_id: product.id,
      quantity: data.quantity,
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleCartProduct).values({
      ...cartProduct,
      created_at: new Date(cartProduct.created_at),
      updated_at: new Date(cartProduct.updated_at),
    });
  }

  async deleteProduct(
    params: DeleteProductCartServiceParamsDTO,
  ): Promise<void> {
    const { cart, cartProduct } = params;

    if (cart.status !== 'open') {
      throw new BadRequestException('Cart is not open');
    }

    await this.drizzleService.db
      .delete(drizzleCartProduct)
      .where(eq(drizzleCartProduct.id, cartProduct.id));
  }

  async updateProduct(
    params: UpdateProductCartServiceParamsDTO,
  ): Promise<void> {
    const { cart, cartProduct, data } = params;

    if (cart.status !== 'open') {
      throw new BadRequestException('Cart is not open');
    }

    await this.drizzleService.db
      .update(drizzleCartProduct)
      .set({ quantity: data.quantity, updated_at: new Date() })
      .where(eq(drizzleCartProduct.id, cartProduct.id));
  }
}
