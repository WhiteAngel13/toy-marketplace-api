import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from 'src/user/user.entity';
import { Notification } from './notification.entity';
import { LoggedUser } from 'src/auth/auth.config';
import { ReqNotification } from './notification.config';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';

export class ListNotificationControllerResponseDTO {
  @ApiProperty({ type: [Notification] })
  notifications!: Notification[];
}

export class GetNotificationControllerResponseDTO {
  @ApiProperty({ type: Notification })
  notification!: Notification;
}

const tags = ['Notificações'];

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/v1/notifications')
  @ApiOperation({ summary: 'Listagem de Notificações', tags })
  @ApiResponse({ type: ListNotificationControllerResponseDTO })
  async find(
    @LoggedUser() user: User,
  ): Promise<ListNotificationControllerResponseDTO> {
    const { notifications } = await this.notificationService.find({
      where: { user_id: user.id },
    });
    return { notifications };
  }

  @Get('/v1/notifications/:id')
  @ApiResponse({ type: GetNotificationControllerResponseDTO })
  @ApiOperation({ summary: 'Detalhes de Notificação por ID', tags })
  get(
    @ReqNotification() notification: Notification,
  ): GetNotificationControllerResponseDTO {
    return { notification };
  }
}
