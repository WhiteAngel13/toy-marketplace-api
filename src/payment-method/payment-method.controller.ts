import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { StoreService } from 'src/store/store.service';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';
import { ReqPaymentMethod } from './payment-method.config';
import { PaymentMethodSchema, PaymentMethod } from './payment-method.entity';
import { PaymentMethodService } from './payment-method.service';
import { ApiOperation } from '@nestjs/swagger';

export const ListPaymentMethodControllerResponseSchema = z.object({
  payment_methods: z.array(PaymentMethodSchema),
});

export class ListPaymentMethodControllerResponseDTO extends createZodDto(
  ListPaymentMethodControllerResponseSchema,
) {}

export const GetPaymentMethodControllerResponseSchema = z.object({
  payment_method: PaymentMethodSchema,
});

export class GetPaymentMethodControllerResponseDTO extends createZodDto(
  GetPaymentMethodControllerResponseSchema,
) {}

export const CreatePaymentMethodControllerBodySchema = z.object({
  title: z.string(),
  image_url: z.string(),
  price: z.number(),
  category_id: z.string(),
  store_id: z.string(),
});

export class CreatePaymentMethodControllerBodyDTO extends createZodDto(
  CreatePaymentMethodControllerBodySchema,
) {}

const tags = ['Métodos de Pagamento'];
@Controller()
export class PaymentMethodController {
  constructor(
    private readonly paymentMethodService: PaymentMethodService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/payment_methods')
  @ApiOperation({ summary: 'Listagem de Métodos de Pagamento', tags })
  async find(): Promise<ListPaymentMethodControllerResponseDTO> {
    const { paymentMethods } = await this.paymentMethodService.find({
      where: {},
    });
    return { payment_methods: paymentMethods };
  }

  @Get('/v1/payment_methods/:id')
  @ApiOperation({ summary: 'Detalhes de um Método de Pagamento por ID', tags })
  get(
    @ReqPaymentMethod() paymentMethod: PaymentMethod,
  ): GetPaymentMethodControllerResponseDTO {
    return { payment_method: paymentMethod };
  }

  @Post('/v1/payment_methods')
  @ApiOperation({ summary: 'Criar um Método de Pagamento', tags })
  async create(
    @Body() body: CreatePaymentMethodControllerBodyDTO,
    @LoggedUser() user: User,
  ): Promise<GetPaymentMethodControllerResponseDTO> {
    const { store } = await this.storeService.get({
      where: { id: body.store_id },
      options: { throwIfNotFound: true },
    });

    if (store.owner_user_id !== user.id) throw new ForbiddenException();

    const { paymentMethod } = await this.paymentMethodService.create({
      data: body,
      store,
    });

    return { payment_method: paymentMethod };
  }
}
