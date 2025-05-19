import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { Category } from './category.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import {
  drizzleCategoryColumns,
  drizzleCategory,
} from 'src/app/drizzle/schemas/product.drizzle.schema';
import { Store } from 'src/store/store.entity';

export type GetCategoryServiceParamsDTO<Options extends GetServiceOptions> = {
  where: FindCategoryServiceParamsDTO['where'];
  options?: Options;
};

export type GetCategoryServiceResponseDTO<Options extends GetServiceOptions> = {
  category: Options['throwIfNotFound'] extends true
    ? Category
    : Category | undefined;
};

export type FindCategoryServiceParamsDTO = {
  where: { id?: string; store_id?: string };
};

export type FindCategoryServiceResponseDTO = {
  categories: Category[];
};

export type CreateCategoryServiceParamsDTO = {
  data: { name: string; image_url: string };
  store: Store;
};

export type CreateCategoryServiceResponseDTO = {
  category: Category;
};

export type UpdateCategoryServiceParamsDTO = {
  data: { name?: string; image_url?: string };
  category: Category;
};

export type UpdateCategoryServiceResponseDTO = {
  category: Category;
};

export type DeleteCategoryServiceParamsDTO = {
  category: Category;
};

@Injectable()
export class CategoryService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetCategoryServiceParamsDTO<Options>,
  ): Promise<GetCategoryServiceResponseDTO<Options>> {
    const { categories } = await this.find({ where: params.where });

    if (categories.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Category not found`);

      return { category: undefined } as GetCategoryServiceResponseDTO<Options>;
    }

    if (categories.length > 1) {
      throw new InternalServerErrorException(
        `More than one Category found, expected only one`,
      );
    }

    const category = categories[0];

    return { category } as GetCategoryServiceResponseDTO<Options>;
  }

  async find(
    params: FindCategoryServiceParamsDTO,
  ): Promise<FindCategoryServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleCategoryColumns)
      .from(drizzleCategory)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleCategoryColumns.id, params.where.id));
    }

    if (params.where.store_id) {
      wheres.push(eq(drizzleCategoryColumns.store_id, params.where.store_id));
    }

    dynamicQuery.where(and(...wheres));

    const categoriesData = await dynamicQuery;

    const categories = categoriesData.map((categoryData): Category => {
      return {
        id: categoryData.id,
        name: categoryData.name,
        image_url: categoryData.image_url,
        store_id: categoryData.store_id,
        created_at: categoryData.created_at.toISOString(),
        updated_at: categoryData.updated_at.toISOString(),
      };
    });

    return { categories };
  }

  async create(
    params: CreateCategoryServiceParamsDTO,
  ): Promise<CreateCategoryServiceResponseDTO> {
    const { data, store } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    const category: Category = {
      id,
      name: data.name,
      image_url: data.image_url,
      store_id: store.id,
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleCategory).values({
      ...category,
      created_at: new Date(category.created_at),
      updated_at: new Date(category.updated_at),
    });

    return { category };
  }

  async update(
    params: UpdateCategoryServiceParamsDTO,
  ): Promise<UpdateCategoryServiceResponseDTO> {
    const { data, category } = params;

    const now = new Date().toISOString();

    const updatedCategory: Category = {
      ...category,
      ...data,
    };

    await this.drizzleService.db
      .update(drizzleCategory)
      .set({
        ...updatedCategory,
        created_at: new Date(category.created_at),
        updated_at: new Date(now),
      })
      .where(eq(drizzleCategoryColumns.id, category.id));

    return { category: updatedCategory };
  }

  async delete(params: DeleteCategoryServiceParamsDTO): Promise<void> {
    const { category } = params;

    await this.drizzleService.db
      .delete(drizzleCategory)
      .where(eq(drizzleCategoryColumns.id, category.id));
  }
}
