import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import {
  drizzleNotification,
  drizzleNotificationColumns,
} from '../app/drizzle/schemas/notification.drizzle.schema';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { Notification } from './notification.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import { User } from 'src/user/user.entity';

export type GetNotificationServiceParamsDTO<Options extends GetServiceOptions> =
  {
    where: FindNotificationServiceParamsDTO['where'];
    options?: Options;
  };

export type GetNotificationServiceResponseDTO<
  Options extends GetServiceOptions,
> = {
  notification: Options['throwIfNotFound'] extends true
    ? Notification
    : Notification | undefined;
};

export type FindNotificationServiceParamsDTO = {
  where: { id?: string; user_id?: string; read?: boolean };
};

export type FindNotificationServiceResponseDTO = {
  notifications: Notification[];
};

export type CreateNotificationServiceParamsDTO = {
  data: {
    title: string;
    message: string;
    metadata?: any;
  };
  user: User;
};

export type CreateNotificationServiceResponseDTO = {
  notification: Notification;
};

export type IsUserNotificationOwnerServiceParamsDTO = {
  notification: Notification;
  user: User;
};

export type IsUserNotificationOwnerServiceResponseDTO = {
  isOwner: boolean;
};

@Injectable()
export class NotificationService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetNotificationServiceParamsDTO<Options>,
  ): Promise<GetNotificationServiceResponseDTO<Options>> {
    const { notifications } = await this.find({ where: params.where });

    if (notifications.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Notification not found`);

      return {
        notification: undefined,
      } as GetNotificationServiceResponseDTO<Options>;
    }

    if (notifications.length > 1) {
      throw new InternalServerErrorException(
        `More than one Notification found, expected only one`,
      );
    }

    const notification = notifications[0];

    return { notification } as GetNotificationServiceResponseDTO<Options>;
  }

  async find(
    params: FindNotificationServiceParamsDTO,
  ): Promise<FindNotificationServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleNotificationColumns)
      .from(drizzleNotification)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleNotificationColumns.id, params.where.id));
    }

    if (params.where.user_id) {
      wheres.push(eq(drizzleNotificationColumns.user_id, params.where.user_id));
    }

    if (params.where.read) {
      wheres.push(eq(drizzleNotificationColumns.read, params.where.read));
    }

    dynamicQuery.where(and(...wheres));

    const notificationsData = await dynamicQuery;

    const notifications = notificationsData.map(
      (notificationData): Notification => {
        return {
          id: notificationData.id,
          message: notificationData.message,
          title: notificationData.title,
          read: notificationData.read,
          user_id: notificationData.user_id,
          metadata: notificationData.metadata,
          created_at: notificationData.created_at.toISOString(),
        };
      },
    );

    return { notifications };
  }

  async create(
    params: CreateNotificationServiceParamsDTO,
  ): Promise<CreateNotificationServiceResponseDTO> {
    const { data, user } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    const notification: Notification = {
      id,
      title: data.title,
      message: data.message,
      user_id: user.id,
      read: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: data.metadata,
      created_at: now,
    };

    await this.drizzleService.db.insert(drizzleNotification).values({
      ...notification,
      metadata: notification.metadata || {},
      created_at: new Date(notification.created_at),
    });

    return { notification };
  }
}
