import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import {
  drizzleStore,
  drizzleStoreColumns,
} from '../app/drizzle/schemas/store.drizzle.schema';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { Store } from './store.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import { User } from 'src/user/user.entity';

export type GetStoreServiceParamsDTO<Options extends GetServiceOptions> = {
  where: FindStoreServiceParamsDTO['where'];
  options?: Options;
};

export type GetStoreServiceResponseDTO<Options extends GetServiceOptions> = {
  store: Options['throwIfNotFound'] extends true ? Store : Store | undefined;
};

export type FindStoreServiceParamsDTO = {
  where: { id?: string };
};

export type FindStoreServiceResponseDTO = {
  stores: Store[];
};

export type CreateStoreServiceParamsDTO = {
  data: { name: string };
  user: User;
};

export type CreateStoreServiceResponseDTO = {
  store: Store;
};

@Injectable()
export class StoreService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetStoreServiceParamsDTO<Options>,
  ): Promise<GetStoreServiceResponseDTO<Options>> {
    const { stores } = await this.find({ where: params.where });

    if (stores.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Store not found`);

      return { store: undefined } as GetStoreServiceResponseDTO<Options>;
    }

    if (stores.length > 1) {
      throw new InternalServerErrorException(
        `More than one Store found, expected only one`,
      );
    }

    const store = stores[0];

    return { store } as GetStoreServiceResponseDTO<Options>;
  }

  async find(
    params: FindStoreServiceParamsDTO,
  ): Promise<FindStoreServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleStoreColumns)
      .from(drizzleStore)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleStoreColumns.id, params.where.id));
    }

    dynamicQuery.where(and(...wheres));

    const storesData = await dynamicQuery;

    const stores = storesData.map((storeData): Store => {
      return {
        id: storeData.id,
        name: storeData.name,
        owner_user_id: storeData.owner_user_id,
        created_at: storeData.created_at.toISOString(),
        updated_at: storeData.updated_at.toISOString(),
      };
    });

    return { stores };
  }

  async create(
    params: CreateStoreServiceParamsDTO,
  ): Promise<CreateStoreServiceResponseDTO> {
    const { data, user } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    const store: Store = {
      id,
      name: data.name,
      owner_user_id: user.id,
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleStore).values({
      ...store,
      created_at: new Date(store.created_at),
      updated_at: new Date(store.updated_at),
    });

    return { store };
  }
}
