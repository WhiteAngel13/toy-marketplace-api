import { GetServiceOptions } from 'src/app/utils/types.utils';
import { User } from './user.entity';

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
