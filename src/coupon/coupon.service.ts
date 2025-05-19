import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { Coupon } from './coupon.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import { Store } from 'src/store/store.entity';
import {
  drizzleCoupon,
  drizzleCouponColumns,
} from 'src/app/drizzle/schemas/store.drizzle.schema';

export type GetCouponServiceParamsDTO<Options extends GetServiceOptions> = {
  where: FindCouponServiceParamsDTO['where'];
  options?: Options;
};

export type GetCouponServiceResponseDTO<Options extends GetServiceOptions> = {
  coupon: Options['throwIfNotFound'] extends true ? Coupon : Coupon | undefined;
};

export type FindCouponServiceParamsDTO = {
  where: { id?: string };
};

export type FindCouponServiceResponseDTO = {
  coupons: Coupon[];
};

export type CreateCouponServiceParamsDTO = {
  data: { code: string; discount: number };
  store: Store;
};

export type CreateCouponServiceResponseDTO = {
  coupon: Coupon;
};

export type UpdateCouponServiceParamsDTO = {
  data: { code?: string; discount?: number };
  coupon: Coupon;
};

export type UpdateCouponServiceResponseDTO = {
  coupon: Coupon;
};

export type DeleteCouponServiceParamsDTO = {
  coupon: Coupon;
};

@Injectable()
export class CouponService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetCouponServiceParamsDTO<Options>,
  ): Promise<GetCouponServiceResponseDTO<Options>> {
    const { coupons } = await this.find({ where: params.where });

    if (coupons.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Coupon not found`);

      return { coupon: undefined } as GetCouponServiceResponseDTO<Options>;
    }

    if (coupons.length > 1) {
      throw new InternalServerErrorException(
        `More than one Coupon found, expected only one`,
      );
    }

    const coupon = coupons[0];

    return { coupon } as GetCouponServiceResponseDTO<Options>;
  }

  async find(
    params: FindCouponServiceParamsDTO,
  ): Promise<FindCouponServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleCouponColumns)
      .from(drizzleCoupon)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleCouponColumns.id, params.where.id));
    }

    dynamicQuery.where(and(...wheres));

    const couponsData = await dynamicQuery;

    const coupons = couponsData.map((couponData): Coupon => {
      return {
        id: couponData.id,
        code: couponData.code,
        discount: couponData.discount,
        store_id: couponData.store_id,
        created_at: couponData.created_at.toISOString(),
        updated_at: couponData.updated_at.toISOString(),
      };
    });

    return { coupons };
  }

  async create(
    params: CreateCouponServiceParamsDTO,
  ): Promise<CreateCouponServiceResponseDTO> {
    const { data, store } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    const coupon: Coupon = {
      id,
      code: data.code,
      discount: data.discount,
      store_id: store.id,
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleCoupon).values({
      ...coupon,
      created_at: new Date(coupon.created_at),
      updated_at: new Date(coupon.updated_at),
    });

    return { coupon };
  }

  async update(
    params: UpdateCouponServiceParamsDTO,
  ): Promise<UpdateCouponServiceResponseDTO> {
    const { data, coupon } = params;

    const now = new Date().toISOString();

    const updatedCoupon: Coupon = {
      ...coupon,
      ...data,
      updated_at: now,
    };

    await this.drizzleService.db
      .update(drizzleCoupon)
      .set({
        ...updatedCoupon,
        created_at: new Date(updatedCoupon.created_at),
        updated_at: new Date(updatedCoupon.updated_at),
      })
      .where(eq(drizzleCouponColumns.id, coupon.id));

    return { coupon: updatedCoupon };
  }

  async delete(
    params: DeleteCouponServiceParamsDTO,
  ): Promise<DeleteCouponServiceParamsDTO> {
    const { coupon } = params;

    await this.drizzleService.db
      .delete(drizzleCoupon)
      .where(eq(drizzleCouponColumns.id, coupon.id));

    return { coupon };
  }
}
