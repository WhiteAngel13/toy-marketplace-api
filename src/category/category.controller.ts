import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { User } from 'src/user/user.entity';
import { createZodDto } from 'nestjs-zod';
import { Category, CategorySchema } from './category.entity';
import { z } from 'zod';
import { LoggedUser } from 'src/auth/auth.config';
import { ReqCategory } from './category.config';
import { StoreService } from 'src/store/store.service';

export const GetCategoryControllerResponseSchema = z.object({
  category: CategorySchema,
});

export class GetCategoryControllerResponseDTO extends createZodDto(
  GetCategoryControllerResponseSchema,
) {}

export const CreateCategoryControllerBodySchema = z.object({
  name: z.string(),
  image_url: z.string(),
  store_id: z.string(),
});

export class CreateCategoryControllerBodyDTO extends createZodDto(
  CreateCategoryControllerBodySchema,
) {}

@Controller()
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly storeService: StoreService,
  ) {}

  @Get('/v1/categories/:id')
  get(@ReqCategory() category: Category): GetCategoryControllerResponseDTO {
    return { category };
  }

  @Post('/v1/categories')
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
}
