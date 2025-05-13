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
import { ApiOperation } from '@nestjs/swagger';

export const ListShippingControllerResponseSchema = z.object({
  shippings: z.array(ShippingSchema),
});
export class ListShippingControllerResponseDTO extends createZodDto(
  ListShippingControllerResponseSchema,
) {}

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

const tags = ['Fretes'];

@Controller()
export class ShippingController {
  constructor(
    private readonly shippingService: ShippingService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/shippings')
  @ApiOperation({ summary: 'Listagem de Fretes', tags })
  async find(): Promise<ListShippingControllerResponseDTO> {
    const { shippings } = await this.shippingService.find({
      where: {},
    });
    return { shippings };
  }

  @Get('/v1/shippings/:id')
  @ApiOperation({ summary: 'Detalhes de Frete por ID', tags })
  get(@ReqShipping() shipping: Shipping): GetShippingControllerResponseDTO {
    return { shipping };
  }

  @Post('/v1/shippings')
  @ApiOperation({ summary: 'Criação de Frete', tags })
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
