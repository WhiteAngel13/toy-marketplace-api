import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import {
  drizzleUser,
  drizzleUserColumns,
} from '../app/drizzle/schemas/user.drizzle.schema';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { User } from './user.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';

export type GetUserServiceParamsDTO<Options extends GetServiceOptions> = {
  where: FindUserServiceParamsDTO['where'];
  options?: Options;
};

export type GetUserServiceResponseDTO<Options extends GetServiceOptions> = {
  user: Options['throwIfNotFound'] extends true ? User : User | undefined;
};

export type FindUserServiceParamsDTO = {
  where: { id?: string; email?: string };
};

export type FindUserServiceResponseDTO = {
  users: User[];
};

export type CreateUserServiceParamsDTO = {
  data: { email: string; password_hash: string };
};

export type CreateUserServiceResponseDTO = {
  user: User;
};

@Injectable()
export class UserService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetUserServiceParamsDTO<Options>,
  ): Promise<GetUserServiceResponseDTO<Options>> {
    const { users } = await this.find({ where: params.where });

    if (users.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`User not found`);

      return { user: undefined } as GetUserServiceResponseDTO<Options>;
    }

    if (users.length > 1) {
      throw new InternalServerErrorException(
        `More than one User found, expected only one`,
      );
    }

    const user = users[0];

    return { user } as GetUserServiceResponseDTO<Options>;
  }

  async find(
    params: FindUserServiceParamsDTO,
  ): Promise<FindUserServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleUserColumns)
      .from(drizzleUser)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleUserColumns.id, params.where.id));
    }

    if (params.where.email) {
      wheres.push(eq(drizzleUserColumns.email, params.where.email));
    }

    dynamicQuery.where(and(...wheres));

    const usersData = await dynamicQuery;

    const users = usersData.map((userData): User => {
      return {
        id: userData.id,
        email: userData.email,
        password_hash: userData.password_hash,
        created_at: userData.created_at.toISOString(),
        updated_at: userData.updated_at.toISOString(),
      };
    });

    return { users };
  }

  async create(
    params: CreateUserServiceParamsDTO,
  ): Promise<CreateUserServiceResponseDTO> {
    const { data } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    const user: User = {
      id,
      email: data.email,
      password_hash: data.password_hash,
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleUser).values({
      ...user,
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at),
    });

    return { user };
  }
}
