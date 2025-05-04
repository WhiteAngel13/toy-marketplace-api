import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { createZodDto } from 'nestjs-zod';
import { Shipping, ShippingSchema } from './shipping.entity';
import { z } from 'zod';
import { ReqShipping } from './shipping.config';
import { StoreService } from 'src/store/store.service';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';

export const GetShippingControllerResponseSchema = z.object({
  shipping: ShippingSchema,
});

export class GetShippingControllerResponseDTO extends createZodDto(
  GetShippingControllerResponseSchema,
) {}

export const CreateShippingControllerBodySchema = z.object({
  title: z.string(),
  image_url: z.string(),
  price: z.number(),
  delivery_time: z.number(),
  store_id: z.string(),
});

export class CreateShippingControllerBodyDTO extends createZodDto(
  CreateShippingControllerBodySchema,
) {}

@Controller()
export class ShippingController {
  constructor(
    private readonly shippingService: ShippingService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/shippings/:id')
  get(@ReqShipping() shipping: Shipping): GetShippingControllerResponseDTO {
    return { shipping };
  }

  @Post('/v1/shippings')
  async create(
    @Body() body: CreateShippingControllerBodyDTO,
    @LoggedUser() user: User,
  ): Promise<GetShippingControllerResponseDTO> {
    const { store } = await this.storeService.get({
      where: { id: body.store_id },
      options: { throwIfNotFound: true },
    });

    if (store.owner_user_id !== user.id) throw new ForbiddenException();

    const { shipping } = await this.shippingService.create({
      data: body,
      store,
    });

    return { shipping };
  }
}
