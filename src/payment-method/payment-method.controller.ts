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
import { StoreService } from 'src/store/store.service';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';
import { PaymentMethodGuard, ReqPaymentMethod } from './payment-method.config';
import { PaymentMethod } from './payment-method.entity';
import { PaymentMethodService } from './payment-method.service';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  OmitType,
  PartialType,
} from '@nestjs/swagger';

export class ListPaymentMethodControllerResponseDTO {
  @ApiProperty({ type: [PaymentMethod] })
  payment_methods!: PaymentMethod[];
}

export class GetPaymentMethodControllerResponseDTO {
  @ApiProperty({ type: PaymentMethod })
  payment_method!: PaymentMethod;
}

export class CreatePaymentMethodControllerBodyDTO extends OmitType(
  PaymentMethod,
  ['id', 'created_at', 'updated_at'],
) {}

export class UpdatePaymentMethodControllerBodyDTO extends PartialType(
  OmitType(PaymentMethod, ['id', 'created_at', 'updated_at']),
) {}

const tags = ['Métodos de Pagamento'];
@Controller()
@UseGuards(PaymentMethodGuard)
export class PaymentMethodController {
  constructor(
    private readonly paymentMethodService: PaymentMethodService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/payment_methods')
  @ApiOperation({ summary: 'Listagem de Métodos de Pagamento', tags })
  @ApiResponse({ type: ListPaymentMethodControllerResponseDTO })
  async find(): Promise<ListPaymentMethodControllerResponseDTO> {
    const { paymentMethods } = await this.paymentMethodService.find({
      where: {},
    });
    return { payment_methods: paymentMethods };
  }

  @Get('/v1/payment_methods/:id')
  @ApiOperation({ summary: 'Detalhes de um Método de Pagamento por ID', tags })
  @ApiResponse({ type: GetPaymentMethodControllerResponseDTO })
  get(
    @ReqPaymentMethod() paymentMethod: PaymentMethod,
  ): GetPaymentMethodControllerResponseDTO {
    return { payment_method: paymentMethod };
  }

  @Post('/v1/payment_methods')
  @ApiOperation({ summary: 'Criar um Método de Pagamento', tags })
  @ApiResponse({ type: GetPaymentMethodControllerResponseDTO })
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

  @Put('/v1/payment_methods/:id')
  @ApiOperation({ summary: 'Atualizar um Método de Pagamento', tags })
  @ApiResponse({ type: GetPaymentMethodControllerResponseDTO })
  async update(
    @Body() body: UpdatePaymentMethodControllerBodyDTO,
    @ReqPaymentMethod() paymentMethod: PaymentMethod,
  ): Promise<GetPaymentMethodControllerResponseDTO> {
    const { paymentMethod: updatedPaymentMethod } =
      await this.paymentMethodService.update({
        data: body,
        paymentMethod,
      });

    return { payment_method: updatedPaymentMethod };
  }

  @Delete('/v1/payment_methods/:id')
  @ApiOperation({ summary: 'Deletar um Método de Pagamento', tags })
  async delete(
    @ReqPaymentMethod() paymentMethod: PaymentMethod,
  ): Promise<void> {
    await this.paymentMethodService.delete({ paymentMethod });
  }
}
