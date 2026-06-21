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
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'List user conversations (grouped by other user)' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  async findConversations(@CurrentUser('id') userId: string) {
    const data = await this.messagesService.findConversations(userId);
    return { data, message: 'Conversations fetched successfully' };
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with a specific user' })
  @ApiParam({ name: 'userId', description: 'Other user ID' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Conversation messages' })
  async findConversation(
    @CurrentUser('id') userId: string,
    @Param('userId', ParseUUIDPipe) otherUserId: string,
    @Query() query: MessageQueryDto,
  ) {
    const result = await this.messagesService.findConversation(userId, otherUserId, {
      cursor: query.cursor,
      take: query.take || 50,
    });
    return { data: result.data, meta: result.meta, message: 'Conversation fetched successfully' };
  }

  @Post()
  @ApiOperation({ summary: 'Send a message to another user' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @Body() dto: CreateMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.messagesService.sendMessage(dto, userId);
    return { data, message: 'Message sent successfully' };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.messagesService.markAsRead(id, userId);
    return { data, message: 'Message marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message deleted' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.messagesService.remove(id, userId);
    return { message: 'Message deleted successfully' };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const data = await this.messagesService.getUnreadCount(userId);
    return { data, message: 'Unread count fetched successfully' };
  }
}
