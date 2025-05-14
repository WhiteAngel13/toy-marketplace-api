import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import { Store } from 'src/store/store.entity';
import {
  drizzlePaymentMethodColumns,
  drizzlePaymentMethod,
} from 'src/app/drizzle/schemas/store.drizzle.schema';
import { PaymentMethod } from './payment-method.entity';

export type GetPaymentMethodServiceParamsDTO<
  Options extends GetServiceOptions,
> = {
  where: FindPaymentMethodServiceParamsDTO['where'];
  options?: Options;
};

export type GetPaymentMethodServiceResponseDTO<
  Options extends GetServiceOptions,
> = {
  paymentMethod: Options['throwIfNotFound'] extends true
    ? PaymentMethod
    : PaymentMethod | undefined;
};

export type FindPaymentMethodServiceParamsDTO = {
  where: { id?: string };
};

export type FindPaymentMethodServiceResponseDTO = {
  paymentMethods: PaymentMethod[];
};

export type CreatePaymentMethodServiceParamsDTO = {
  data: { name: string };
  store: Store;
};

export type CreatePaymentMethodServiceResponseDTO = {
  paymentMethod: PaymentMethod;
};

@Injectable()
export class PaymentMethodService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetPaymentMethodServiceParamsDTO<Options>,
  ): Promise<GetPaymentMethodServiceResponseDTO<Options>> {
    const { paymentMethods } = await this.find({
      where: params.where,
    });

    if (paymentMethods.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`PaymentMethod not found`);

      return {
        paymentMethod: undefined,
      } as GetPaymentMethodServiceResponseDTO<Options>;
    }

    if (paymentMethods.length > 1) {
      throw new InternalServerErrorException(
        `More than one PaymentMethod found, expected only one`,
      );
    }

    const paymentMethod = paymentMethods[0];

    return { paymentMethod } as GetPaymentMethodServiceResponseDTO<Options>;
  }

  async find(
    params: FindPaymentMethodServiceParamsDTO,
  ): Promise<FindPaymentMethodServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzlePaymentMethodColumns)
      .from(drizzlePaymentMethod)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzlePaymentMethodColumns.id, params.where.id));
    }

    dynamicQuery.where(and(...wheres));

    const paymentMethodsData = await dynamicQuery;

    const paymentMethods = paymentMethodsData.map(
      (paymentMethodData): PaymentMethod => {
        return {
          id: paymentMethodData.id,
          name: paymentMethodData.name,
          store_id: paymentMethodData.store_id,
          created_at: paymentMethodData.created_at.toISOString(),
          updated_at: paymentMethodData.updated_at.toISOString(),
        };
      },
    );

    return { paymentMethods: paymentMethods };
  }

  async create(
    params: CreatePaymentMethodServiceParamsDTO,
  ): Promise<CreatePaymentMethodServiceResponseDTO> {
    const { data, store } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    const paymentMethod: PaymentMethod = {
      id,
      name: data.name,
      store_id: store.id,
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzlePaymentMethod).values({
      ...paymentMethod,
      created_at: new Date(paymentMethod.created_at),
      updated_at: new Date(paymentMethod.updated_at),
    });

    return { paymentMethod };
  }
}
