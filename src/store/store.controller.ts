import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { User } from 'src/user/user.entity';
import { Store } from './store.entity';
import { LoggedUser } from 'src/auth/auth.config';
import { ReqStore, StoreGuard } from './store.config';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  OmitType,
  PartialType,
} from '@nestjs/swagger';

export class ListStoreControllerResponseDTO {
  @ApiProperty({ type: [Store] })
  stores!: Store[];
}

export class GetStoreControllerResponseDTO {
  @ApiProperty({ type: Store })
  store!: Store;
}

export class CreateStoreControllerBodyDTO extends OmitType(Store, [
  'id',
  'created_at',
  'owner_user_id',
  'updated_at',
] as const) {}

export class UpdateStoreControllerBodyDTO extends PartialType(
  OmitType(Store, ['id', 'created_at', 'owner_user_id', 'updated_at'] as const),
) {}

const tags = ['Lojas'];
@Controller()
@UseGuards(StoreGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('/v1/stores')
  @ApiOperation({ summary: 'Listagem de Lojas', tags })
  @ApiResponse({ type: ListStoreControllerResponseDTO })
  async find(): Promise<ListStoreControllerResponseDTO> {
    const { stores } = await this.storeService.find({
      where: {},
    });
    return { stores };
  }

  @Get('/v1/stores/:id')
  @ApiOperation({ summary: 'Detalhes de uma Loja por ID', tags })
  @ApiResponse({ type: GetStoreControllerResponseDTO })
  get(@ReqStore() store: Store): GetStoreControllerResponseDTO {
    return { store };
  }

  @Post('/v1/stores')
  @ApiOperation({ summary: 'Criação de Lojas', tags })
  @ApiResponse({ type: GetStoreControllerResponseDTO })
  async create(
    @Body() body: CreateStoreControllerBodyDTO,
    @LoggedUser() user: User,
  ): Promise<GetStoreControllerResponseDTO> {
    const { store } = await this.storeService.create({ data: body, user });
    return { store };
  }

  @Put('/v1/stores/:id')
  @ApiOperation({ summary: 'Atualização de Lojas', tags })
  @ApiResponse({ type: GetStoreControllerResponseDTO })
  async update(
    @Body() body: UpdateStoreControllerBodyDTO,
    @ReqStore() store: Store,
  ): Promise<GetStoreControllerResponseDTO> {
    const { store: updatedStore } = await this.storeService.update({
      data: body,
      store,
    });
    return { store: updatedStore };
  }

  @Delete('/v1/stores/:id')
  @ApiOperation({ summary: 'Deleção de Lojas', tags })
  async delete(@ReqStore() store: Store): Promise<void> {
    await this.storeService.delete({ store });
  }
}
