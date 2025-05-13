import { Body, Controller, Get, Post } from '@nestjs/common';
import { StoreService } from './store.service';
import { User } from 'src/user/user.entity';
import { createZodDto } from 'nestjs-zod';
import { Store, StoreSchema } from './store.entity';
import { z } from 'zod';
import { LoggedUser } from 'src/auth/auth.config';
import { ReqStore } from './store.config';
import { ApiOperation } from '@nestjs/swagger';

export const ListStoreControllerResponseSchema = z.object({
  stores: z.array(StoreSchema),
});

export class ListStoreControllerResponseDTO extends createZodDto(
  ListStoreControllerResponseSchema,
) {}

export const GetStoreControllerResponseSchema = z.object({
  store: StoreSchema,
});

export class GetStoreControllerResponseDTO extends createZodDto(
  GetStoreControllerResponseSchema,
) {}

export const CreateStoreControllerBodySchema = z.object({
  name: z.string(),
});

export class CreateStoreControllerBodyDTO extends createZodDto(
  CreateStoreControllerBodySchema,
) {}

@Controller()
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiOperation({ summary: 'List stores' })
  @Get('/v1/stores')
  async find(): Promise<ListStoreControllerResponseDTO> {
    const { stores } = await this.storeService.find({
      where: {},
    });
    return { stores };
  }

  @Get('/v1/stores/:id')
  get(@ReqStore() store: Store): GetStoreControllerResponseDTO {
    return { store };
  }

  @Post('/v1/stores')
  async create(
    @Body() body: CreateStoreControllerBodyDTO,
    @LoggedUser() user: User,
  ): Promise<GetStoreControllerResponseDTO> {
    const { store } = await this.storeService.create({ data: body, user });
    return { store };
  }
}
