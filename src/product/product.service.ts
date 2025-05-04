import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import {
  drizzleProduct,
  drizzleProductColumns,
} from '../app/drizzle/schemas/product.drizzle.schema';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { Product } from './product.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import { Store } from 'src/store/store.entity';
import { Category } from 'src/category/category.entity';

export type GetProductServiceParamsDTO<Options extends GetServiceOptions> = {
  where: FindProductServiceParamsDTO['where'];
  options?: Options;
};

export type GetProductServiceResponseDTO<Options extends GetServiceOptions> = {
  product: Options['throwIfNotFound'] extends true
    ? Product
    : Product | undefined;
};

export type FindProductServiceParamsDTO = {
  where: { id?: string };
};

export type FindProductServiceResponseDTO = {
  products: Product[];
};

export type CreateProductServiceParamsDTO = {
  data: { title: string; image_url: string; price: number };
  store: Store;
  category: Category;
};

export type CreateProductServiceResponseDTO = {
  product: Product;
};

@Injectable()
export class ProductService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetProductServiceParamsDTO<Options>,
  ): Promise<GetProductServiceResponseDTO<Options>> {
    const { products } = await this.find({ where: params.where });

    if (products.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Product not found`);

      return { product: undefined } as GetProductServiceResponseDTO<Options>;
    }

    if (products.length > 1) {
      throw new InternalServerErrorException(
        `More than one Product found, expected only one`,
      );
    }

    const product = products[0];

    return { product } as GetProductServiceResponseDTO<Options>;
  }

  async find(
    params: FindProductServiceParamsDTO,
  ): Promise<FindProductServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleProductColumns)
      .from(drizzleProduct)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleProductColumns.id, params.where.id));
    }

    dynamicQuery.where(and(...wheres));

    const productsData = await dynamicQuery;

    const products = productsData.map((productData): Product => {
      return {
        id: productData.id,
        title: productData.title,
        image_url: productData.image_url,
        category_id: productData.category_id,
        price: productData.price,
        store_id: productData.store_id,
        created_at: productData.created_at.toISOString(),
        updated_at: productData.updated_at.toISOString(),
      };
    });

    return { products };
  }

  async create(
    params: CreateProductServiceParamsDTO,
  ): Promise<CreateProductServiceResponseDTO> {
    const { data, category, store } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    const product: Product = {
      id,
      title: data.title,
      image_url: data.image_url,
      price: data.price,
      store_id: store.id,
      category_id: category.id,
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleProduct).values({
      ...product,
      created_at: new Date(product.created_at),
      updated_at: new Date(product.updated_at),
    });

    return { product };
  }
}
