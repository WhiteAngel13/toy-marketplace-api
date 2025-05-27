import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdService } from './ad.service';
import { Ad } from './ad.entity';
import { AdGuard, ReqAd } from './ad.config';
import { StoreService } from 'src/store/store.service';
import { LoggedUser } from 'src/auth/auth.config';
import { User } from 'src/user/user.entity';
import { ProductService } from 'src/product/product.service';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  OmitType,
  PartialType,
} from '@nestjs/swagger';

export class ListAdControllerResponseDTO {
  @ApiProperty({ type: [Ad] })
  ads!: Ad[];
}

export class GetAdControllerResponseDTO {
  @ApiProperty({ type: Ad })
  ad!: Ad;
}

export class CreateAdControllerBodyDTO extends OmitType(Ad, [
  'id',
  'created_at',
  'updated_at',
]) {}

export class UpdateAdControllerBodyDTO extends PartialType(
  OmitType(Ad, ['id', 'created_at', 'updated_at']),
) {}

const tags = ['Anúncios'];

@Controller()
@UseGuards(AdGuard)
export class AdController {
  constructor(
    private readonly adService: AdService,
    private readonly productService: ProductService,
    private readonly storeService: StoreService,
  ) {}

  @ApiOperation({ summary: 'Listagem de Anúncios', tags })
  @ApiResponse({ type: ListAdControllerResponseDTO })
  @Get('/v1/ads')
  async find(): Promise<ListAdControllerResponseDTO> {
    const { ads } = await this.adService.find({
      where: {},
    });
    return { ads };
  }

  @ApiOperation({ summary: 'Detalhes do Anúncio por ID', tags })
  @ApiResponse({ type: GetAdControllerResponseDTO })
  @Get('/v1/ads/:id')
  get(@ReqAd() ad: Ad): GetAdControllerResponseDTO {
    return { ad };
  }

  @ApiOperation({ summary: 'Criar Anúncio', tags })
  @ApiResponse({ type: GetAdControllerResponseDTO })
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

  @ApiOperation({ summary: 'Atualizar Anúncio', tags })
  @ApiResponse({ type: GetAdControllerResponseDTO })
  @Post('/v1/ads/:id')
  async update(
    @ReqAd() ad: Ad,
    @Body() body: UpdateAdControllerBodyDTO,
  ): Promise<GetAdControllerResponseDTO> {
    const { ad: updatedAd } = await this.adService.update({
      data: body,
      ad,
    });

    return { ad: updatedAd };
  }

  @ApiOperation({ summary: 'Deletar Anúncio', tags })
  @Post('/v1/ads/:id/delete')
  async delete(@ReqAd() ad: Ad): Promise<void> {
    await this.adService.delete({ ad });
  }
}
