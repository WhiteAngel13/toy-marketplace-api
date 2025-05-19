import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { Shipping } from './shipping.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import { Store } from 'src/store/store.entity';
import {
  drizzleShippingColumns,
  drizzleShipping,
} from 'src/app/drizzle/schemas/store.drizzle.schema';

export type GetShippingServiceParamsDTO<Options extends GetServiceOptions> = {
  where: FindShippingServiceParamsDTO['where'];
  options?: Options;
};

export type GetShippingServiceResponseDTO<Options extends GetServiceOptions> = {
  shipping: Options['throwIfNotFound'] extends true
    ? Shipping
    : Shipping | undefined;
};

export type FindShippingServiceParamsDTO = {
  where: { id?: string };
};

export type FindShippingServiceResponseDTO = {
  shippings: Shipping[];
};

export type CreateShippingServiceParamsDTO = {
  data: {
    name: string;
    price: number;
    delivery_time: number;
  };
  store: Store;
};

export type CreateShippingServiceResponseDTO = {
  shipping: Shipping;
};

export type UpdateShippingServiceParamsDTO = {
  data: {
    name?: string;
    price?: number;
    delivery_time?: number;
  };
  shipping: Shipping;
};

export type UpdateShippingServiceResponseDTO = {
  shipping: Shipping;
};

export type DeleteShippingServiceParamsDTO = {
  shipping: Shipping;
};

@Injectable()
export class ShippingService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetShippingServiceParamsDTO<Options>,
  ): Promise<GetShippingServiceResponseDTO<Options>> {
    const { shippings } = await this.find({ where: params.where });

    if (shippings.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Shipping not found`);

      return { shipping: undefined } as GetShippingServiceResponseDTO<Options>;
    }

    if (shippings.length > 1) {
      throw new InternalServerErrorException(
        `More than one Shipping found, expected only one`,
      );
    }

    const shipping = shippings[0];

    return { shipping } as GetShippingServiceResponseDTO<Options>;
  }

  async find(
    params: FindShippingServiceParamsDTO,
  ): Promise<FindShippingServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleShippingColumns)
      .from(drizzleShipping)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleShippingColumns.id, params.where.id));
    }

    dynamicQuery.where(and(...wheres));

    const shippingsData = await dynamicQuery;

    const shippings = shippingsData.map((shippingData): Shipping => {
      return {
        id: shippingData.id,
        name: shippingData.name,
        price: shippingData.price,
        store_id: shippingData.store_id,
        delivery_time: shippingData.delivery_time,
        created_at: shippingData.created_at.toISOString(),
        updated_at: shippingData.updated_at.toISOString(),
      };
    });

    return { shippings };
  }

  async create(
    params: CreateShippingServiceParamsDTO,
  ): Promise<CreateShippingServiceResponseDTO> {
    const { data, store } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    const shipping: Shipping = {
      id,
      store_id: store.id,
      delivery_time: data.delivery_time,
      name: data.name,
      price: data.price,
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleShipping).values({
      ...shipping,
      created_at: new Date(shipping.created_at),
      updated_at: new Date(shipping.updated_at),
    });

    return { shipping };
  }

  async update(
    params: UpdateShippingServiceParamsDTO,
  ): Promise<UpdateShippingServiceResponseDTO> {
    const { data, shipping } = params;

    const now = new Date().toISOString();

    const updatedShipping: Shipping = {
      ...shipping,
      ...data,
      updated_at: now,
    };

    await this.drizzleService.db
      .update(drizzleShipping)
      .set({
        ...updatedShipping,
        created_at: new Date(updatedShipping.created_at),
        updated_at: new Date(updatedShipping.updated_at),
      })
      .where(eq(drizzleShippingColumns.id, shipping.id));

    return { shipping: updatedShipping };
  }

  async delete(params: DeleteShippingServiceParamsDTO): Promise<void> {
    const { shipping } = params;

    await this.drizzleService.db
      .delete(drizzleShipping)
      .where(eq(drizzleShippingColumns.id, shipping.id));
  }
}
