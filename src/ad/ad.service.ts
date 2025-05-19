import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { Ad } from './ad.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import { Store } from 'src/store/store.entity';
import {
  drizzleAdColumns,
  drizzleAd,
} from 'src/app/drizzle/schemas/store.drizzle.schema';
import { Product } from 'src/product/product.entity';

export type GetAdServiceParamsDTO<Options extends GetServiceOptions> = {
  where: FindAdServiceParamsDTO['where'];
  options?: Options;
};

export type GetAdServiceResponseDTO<Options extends GetServiceOptions> = {
  ad: Options['throwIfNotFound'] extends true ? Ad : Ad | undefined;
};

export type FindAdServiceParamsDTO = {
  where: { id?: string };
};

export type FindAdServiceResponseDTO = {
  ads: Ad[];
};

export type CreateAdServiceParamsDTO = {
  data: { image_url: string };
  store: Store;
  product: Product;
};

export type CreateAdServiceResponseDTO = {
  ad: Ad;
};

export type UpdateAdServiceParamsDTO = {
  data: { image_url?: string };
  ad: Ad;
};

export type UpdateAdServiceResponseDTO = {
  ad: Ad;
};

export type DeleteAdServiceParamsDTO = {
  ad: Ad;
};

@Injectable()
export class AdService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetAdServiceParamsDTO<Options>,
  ): Promise<GetAdServiceResponseDTO<Options>> {
    const { ads } = await this.find({ where: params.where });

    if (ads.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Ad not found`);

      return { ad: undefined } as GetAdServiceResponseDTO<Options>;
    }

    if (ads.length > 1) {
      throw new InternalServerErrorException(
        `More than one Ad found, expected only one`,
      );
    }

    const ad = ads[0];

    return { ad } as GetAdServiceResponseDTO<Options>;
  }

  async find(
    params: FindAdServiceParamsDTO,
  ): Promise<FindAdServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleAdColumns)
      .from(drizzleAd)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleAdColumns.id, params.where.id));
    }

    dynamicQuery.where(and(...wheres));

    const adsData = await dynamicQuery;

    const ads = adsData.map((adData): Ad => {
      return {
        id: adData.id,
        image_url: adData.image_url,
        product_id: adData.product_id,
        store_id: adData.store_id,
        created_at: adData.created_at.toISOString(),
        updated_at: adData.updated_at.toISOString(),
      };
    });

    return { ads };
  }

  async create(
    params: CreateAdServiceParamsDTO,
  ): Promise<CreateAdServiceResponseDTO> {
    const { data, product, store } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    const ad: Ad = {
      id,
      image_url: data.image_url,
      store_id: store.id,
      product_id: product.id,
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleAd).values({
      ...ad,
      created_at: new Date(ad.created_at),
      updated_at: new Date(ad.updated_at),
    });

    return { ad };
  }

  async update(
    params: UpdateAdServiceParamsDTO,
  ): Promise<UpdateAdServiceResponseDTO> {
    const { data, ad } = params;

    const now = new Date().toISOString();

    const updatedAd: Ad = {
      ...ad,
      image_url: data.image_url ?? ad.image_url,
    };

    await this.drizzleService.db
      .update(drizzleAd)
      .set({
        ...updatedAd,
        created_at: new Date(ad.created_at),
        updated_at: new Date(now),
      })
      .where(eq(drizzleAdColumns.id, ad.id));

    return { ad: updatedAd };
  }

  async delete(params: DeleteAdServiceParamsDTO): Promise<void> {
    const { ad } = params;

    await this.drizzleService.db
      .delete(drizzleAd)
      .where(eq(drizzleAdColumns.id, ad.id));
  }
}
