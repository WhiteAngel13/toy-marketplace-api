import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { User } from 'src/user/user.entity';
import { Category } from './category.entity';
import { LoggedUser } from 'src/auth/auth.config';
import { CategoryGuard, ReqCategory } from './category.config';
import { StoreService } from 'src/store/store.service';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  OmitType,
  PartialType,
} from '@nestjs/swagger';

export class ListCategoryControllerResponseDTO {
  @ApiProperty({ type: [Category] })
  categories!: Category[];
}

export class GetCategoryControllerResponseDTO {
  @ApiProperty({ type: Category })
  category!: Category;
}

export class CreateCategoryControllerBodyDTO extends OmitType(Category, [
  'id',
  'created_at',
  'updated_at',
]) {}

export class UpdateCategoryControllerBodyDTO extends PartialType(
  OmitType(Category, ['id', 'created_at', 'updated_at']),
) {}

const tags = ['Categorias'];

@Controller()
@UseGuards(CategoryGuard)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/categories')
  @ApiOperation({ summary: 'Listagem de Categorias', tags })
  @ApiResponse({ type: ListCategoryControllerResponseDTO })
  async find(): Promise<ListCategoryControllerResponseDTO> {
    const { categories } = await this.categoryService.find({
      where: {},
    });
    return { categories };
  }

  @Get('/v1/categories/:id')
  @ApiOperation({ summary: 'Detalhes de uma Categoria por ID', tags })
  @ApiResponse({ type: GetCategoryControllerResponseDTO })
  get(@ReqCategory() category: Category): GetCategoryControllerResponseDTO {
    return { category };
  }

  @Post('/v1/categories')
  @ApiOperation({ summary: 'Criar uma Categoria', tags })
  @ApiResponse({ type: GetCategoryControllerResponseDTO })
  async create(
    @Body() body: CreateCategoryControllerBodyDTO,
    @LoggedUser() user: User,
  ): Promise<GetCategoryControllerResponseDTO> {
    const { store } = await this.storeService.get({
      where: { id: body.store_id },
      options: { throwIfNotFound: true },
    });

    if (store.owner_user_id !== user.id) {
      throw new ForbiddenException('User is not the owner of the store');
    }

    const { category } = await this.categoryService.create({
      data: body,
      store,
    });

    return { category };
  }

  @Put('/v1/categories/:id')
  @ApiOperation({ summary: 'Atualizar uma Categoria', tags })
  @ApiResponse({ type: GetCategoryControllerResponseDTO })
  async update(
    @Body() body: UpdateCategoryControllerBodyDTO,
    @ReqCategory() category: Category,
  ): Promise<GetCategoryControllerResponseDTO> {
    const { category: updatedCategory } = await this.categoryService.update({
      data: body,
      category,
    });

    return { category: updatedCategory };
  }
}
