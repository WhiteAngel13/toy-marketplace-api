import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  Put,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Coupon } from './coupon.entity';
import { ReqCoupon } from './coupon.config';
import { StoreService } from 'src/store/store.service';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  OmitType,
  PartialType,
} from '@nestjs/swagger';

export class ListCouponControllerResponseDTO {
  @ApiProperty({ type: [Coupon] })
  coupons!: Coupon[];
}

export class GetCouponControllerResponseDTO {
  @ApiProperty({ type: Coupon })
  coupon!: Coupon;
}

export class CreateCouponControllerBodyDTO extends OmitType(Coupon, [
  'id',
  'created_at',
  'updated_at',
]) {}

export class UpdateCouponControllerBodyDTO extends PartialType(
  OmitType(Coupon, ['id', 'created_at', 'updated_at']),
) {}

const tags = ['Cupons'];

@Controller()
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/coupons')
  @ApiOperation({ summary: 'Listagem de Cupons', tags })
  @ApiResponse({ type: ListCouponControllerResponseDTO })
  async find(): Promise<ListCouponControllerResponseDTO> {
    const { coupons } = await this.couponService.find({
      where: {},
    });
    return { coupons };
  }

  @Get('/v1/coupons/:id')
  @ApiOperation({ summary: 'Detalhes do Cupom por ID', tags })
  @ApiResponse({ type: GetCouponControllerResponseDTO })
  get(@ReqCoupon() coupon: Coupon): GetCouponControllerResponseDTO {
    return { coupon };
  }

  @Post('/v1/coupons')
  @ApiOperation({ summary: 'Criar Cupom', tags })
  @ApiResponse({ type: GetCouponControllerResponseDTO })
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

  @Put('/v1/coupons/:id')
  @ApiOperation({ summary: 'Atualizar Cupom', tags })
  @ApiResponse({ type: GetCouponControllerResponseDTO })
  async update(
    @Body() body: UpdateCouponControllerBodyDTO,
    @ReqCoupon() coupon: Coupon,
  ): Promise<GetCouponControllerResponseDTO> {
    const { coupon: updatedCoupon } = await this.couponService.update({
      data: body,
      coupon,
    });

    return { coupon: updatedCoupon };
  }

  @Delete('/v1/coupons/:id')
  @ApiOperation({ summary: 'Deletar Cupom', tags })
  async delete(@ReqCoupon() coupon: Coupon): Promise<void> {
    await this.couponService.delete({ coupon });
  }
}
