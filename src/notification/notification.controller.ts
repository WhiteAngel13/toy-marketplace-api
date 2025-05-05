import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from 'src/user/user.entity';
import { createZodDto } from 'nestjs-zod';
import { Notification, NotificationSchema } from './notification.entity';
import { z } from 'zod';
import { LoggedUser } from 'src/auth/auth.config';
import { ReqNotification } from './notification.config';

export const ListNotificationControllerResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
});

export class ListNotificationControllerResponseDTO extends createZodDto(
  ListNotificationControllerResponseSchema,
) {}

export const GetNotificationControllerResponseSchema = z.object({
  notification: NotificationSchema,
});

export class GetNotificationControllerResponseDTO extends createZodDto(
  GetNotificationControllerResponseSchema,
) {}

export const CreateNotificationControllerBodySchema = z.object({
  name: z.string(),
});

export class CreateNotificationControllerBodyDTO extends createZodDto(
  CreateNotificationControllerBodySchema,
) {}

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/v1/notifications')
  async find(
    @LoggedUser() user: User,
  ): Promise<ListNotificationControllerResponseDTO> {
    const { notifications } = await this.notificationService.find({
      where: { user_id: user.id },
    });
    return { notifications };
  }

  @Get('/v1/notifications/:id')
  get(
    @ReqNotification() notification: Notification,
  ): GetNotificationControllerResponseDTO {
    return { notification };
  }
}
