import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { createZodDto } from 'nestjs-zod';
import { Coupon, CouponSchema } from './coupon.entity';
import { z } from 'zod';
import { ReqCoupon } from './coupon.config';
import { StoreService } from 'src/store/store.service';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';

export const ListCouponControllerResponseSchema = z.object({
  coupons: z.array(CouponSchema),
});

export class ListCouponControllerResponseDTO extends createZodDto(
  ListCouponControllerResponseSchema,
) {}

export const GetCouponControllerResponseSchema = z.object({
  coupon: CouponSchema,
});

export class GetCouponControllerResponseDTO extends createZodDto(
  GetCouponControllerResponseSchema,
) {}

export const CreateCouponControllerBodySchema = z.object({
  code: z.string(),
  discount: z.number(),
  store_id: z.string(),
});

export class CreateCouponControllerBodyDTO extends createZodDto(
  CreateCouponControllerBodySchema,
) {}

@Controller()
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/coupons')
  async find(): Promise<ListCouponControllerResponseDTO> {
    const { coupons } = await this.couponService.find({
      where: {},
    });
    return { coupons };
  }

  @Get('/v1/coupons/:id')
  get(@ReqCoupon() coupon: Coupon): GetCouponControllerResponseDTO {
    return { coupon };
  }

  @Post('/v1/coupons')
  async create(
    @Body() body: CreateCouponControllerBodyDTO,
    @LoggedUser() user: User,
  ): Promise<GetCouponControllerResponseDTO> {
    const { store } = await this.storeService.get({
      where: { id: body.store_id },
      options: { throwIfNotFound: true },
    });

    if (store.owner_user_id !== user.id) throw new ForbiddenException();

    const { coupon } = await this.couponService.create({
      data: body,
      store,
    });

    return { coupon };
  }
}
