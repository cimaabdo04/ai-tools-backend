import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, BulkCreateNotificationDto } from './dto/create-notification.dto';
import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List user notifications (paginated)' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: 'Paginated notifications' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('type') type?: string,
  ) {
    const data = await this.notificationsService.findAll(userId, {
      cursor,
      take: take || 20,
      unreadOnly: unreadOnly === 'true',
      type,
    });
    return { data: data.data, meta: data.meta, message: 'Notifications fetched successfully' };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const data = await this.notificationsService.getUnreadCount(userId);
    return { data, message: 'Unread count fetched successfully' };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.notificationsService.markAsRead(id, userId);
    return { data, message: 'Notification marked as read' };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All marked as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    const data = await this.notificationsService.markAllAsRead(userId);
    return { data, message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.notificationsService.remove(id, userId);
    return { message: 'Notification deleted successfully' };
  }

  @Post('settings')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: NotificationSettingsDto,
  ) {
    const data = await this.notificationsService.updateSettings(
      userId,
      dto as unknown as Record<string, unknown>,
    );
    return { data, message: 'Notification settings updated' };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Settings retrieved' })
  async getSettings(@CurrentUser('id') userId: string) {
    const data = await this.notificationsService.getSettings(userId);
    return { data, message: 'Notification settings fetched successfully' };
  }

  // Admin broadcast
  @Post('broadcast')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Broadcast notification to multiple users (admin)' })
  @ApiResponse({ status: 201, description: 'Notifications sent' })
  async broadcast(@Body() dto: BulkCreateNotificationDto) {
    const data = await this.notificationsService.bulkCreate(dto);
    return { data, message: 'Notifications broadcasted successfully' };
  }
}
