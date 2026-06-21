import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Bookmarks')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get()
  @ApiOperation({ summary: 'List user bookmarks (paginated)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Pagination cursor' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Page size' })
  @ApiResponse({ status: 200, description: 'Paginated bookmarks' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
  ) {
    return this.bookmarksService.findByUser(userId, { cursor, take: take ? Number(take) : undefined });
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add bookmark for current user' })
  @ApiResponse({ status: 201, description: 'Bookmark created' })
  @ApiResponse({ status: 409, description: 'Already bookmarked' })
  async create(@Body() dto: CreateBookmarkDto, @CurrentUser('id') userId: string) {
    const data = await this.bookmarksService.create(dto, userId);
    return { data };
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get('check/:toolId')
  @ApiOperation({ summary: 'Check if a tool is bookmarked' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Bookmark status' })
  async check(
    @Param('toolId', ParseUUIDPipe) toolId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookmarksService.check(toolId, userId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Delete(':toolId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove bookmark' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiResponse({ status: 204, description: 'Bookmark removed' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async remove(
    @Param('toolId', ParseUUIDPipe) toolId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.bookmarksService.remove(toolId, userId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post(':toolId/note')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add or update note on a bookmark' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Note updated' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async updateNote(
    @Param('toolId', ParseUUIDPipe) toolId: string,
    @Body() dto: UpdateBookmarkDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.bookmarksService.updateNote(toolId, dto, userId);
    return { data };
  }
}
