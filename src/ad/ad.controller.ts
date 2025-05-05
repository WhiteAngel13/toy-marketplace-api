import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { AdService } from './ad.service';
import { createZodDto } from 'nestjs-zod';
import { Ad, AdSchema } from './ad.entity';
import { z } from 'zod';
import { ReqAd } from './ad.config';
import { StoreService } from 'src/store/store.service';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';
import { ProductService } from 'src/product/product.service';

export const ListAdControllerResponseSchema = z.object({
  ads: z.array(AdSchema),
});
export class ListAdControllerResponseDTO extends createZodDto(
  ListAdControllerResponseSchema,
) {}

export const GetAdControllerResponseSchema = z.object({
  ad: AdSchema,
});

export class GetAdControllerResponseDTO extends createZodDto(
  GetAdControllerResponseSchema,
) {}

export const CreateAdControllerBodySchema = z.object({
  image_url: z.string(),
  product_id: z.string(),
  store_id: z.string(),
});

export class CreateAdControllerBodyDTO extends createZodDto(
  CreateAdControllerBodySchema,
) {}

@Controller()
export class AdController {
  constructor(
    private readonly adService: AdService,
    private readonly productService: ProductService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/ads')
  async find(): Promise<ListAdControllerResponseDTO> {
    const { ads } = await this.adService.find({
      where: {},
    });
    return { ads };
  }

  @Get('/v1/ads/:id')
  get(@ReqAd() ad: Ad): GetAdControllerResponseDTO {
    return { ad };
  }

  @Post('/v1/ads')
  async create(
    @Body() body: CreateAdControllerBodyDTO,
    @LoggedUser() user: User,
  ): Promise<GetAdControllerResponseDTO> {
    const { store } = await this.storeService.get({
      where: { id: body.store_id },
      options: { throwIfNotFound: true },
    });

    if (store.owner_user_id !== user.id) throw new ForbiddenException();

    const { product } = await this.productService.get({
      where: { id: body.product_id, store_id: body.store_id },
      options: { throwIfNotFound: true },
    });

    const { ad } = await this.adService.create({
      data: body,
      product,
      store,
    });

    return { ad };
  }
}
