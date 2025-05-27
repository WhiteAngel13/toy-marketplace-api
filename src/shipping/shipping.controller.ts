import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { Shipping } from './shipping.entity';
import { ReqShipping, ShippingGuard } from './shipping.config';
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

export class ListShippingControllerResponseDTO {
  @ApiProperty({ type: [Shipping] })
  shippings!: Shipping[];
}

export class GetShippingControllerResponseDTO {
  @ApiProperty({ type: Shipping })
  shipping!: Shipping;
}

export class CreateShippingControllerBodyDTO extends OmitType(Shipping, [
  'id',
  'created_at',
  'updated_at',
] as const) {}

export class UpdateShippingControllerBodyDTO extends PartialType(
  OmitType(Shipping, ['id', 'created_at', 'updated_at'] as const),
) {}

const tags = ['Fretes'];

@Controller()
@UseGuards(ShippingGuard)
export class ShippingController {
  constructor(
    private readonly shippingService: ShippingService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/shippings')
  @ApiOperation({ summary: 'Listagem de Fretes', tags })
  @ApiResponse({ type: ListShippingControllerResponseDTO })
  async find(): Promise<ListShippingControllerResponseDTO> {
    const { shippings } = await this.shippingService.find({
      where: {},
    });
    return { shippings };
  }

  @Get('/v1/shippings/:id')
  @ApiOperation({ summary: 'Detalhes de Frete por ID', tags })
  @ApiResponse({ type: GetShippingControllerResponseDTO })
  get(@ReqShipping() shipping: Shipping): GetShippingControllerResponseDTO {
    return { shipping };
  }

  @Post('/v1/shippings')
  @ApiOperation({ summary: 'Criação de Frete', tags })
  @ApiResponse({ type: GetShippingControllerResponseDTO })
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

  @Put('/v1/shippings/:id')
  @ApiOperation({ summary: 'Atualização de Frete', tags })
  @ApiResponse({ type: GetShippingControllerResponseDTO })
  async update(
    @ReqShipping() shipping: Shipping,
    @Body() body: UpdateShippingControllerBodyDTO,
  ): Promise<GetShippingControllerResponseDTO> {
    const { shipping: updatedShipping } = await this.shippingService.update({
      shipping,
      data: body,
    });

    return { shipping: updatedShipping };
  }

  @Delete('/v1/shippings/:id')
  @ApiOperation({ summary: 'Remoção de Frete', tags })
  async delete(@ReqShipping() shipping: Shipping): Promise<void> {
    await this.shippingService.delete({ shipping });
  }
}
