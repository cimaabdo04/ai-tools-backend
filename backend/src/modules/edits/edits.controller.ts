import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
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
import { EditsService } from './edits.service';
import { CreateEditDto } from './dto/create-edit.dto';
import { ReviewEditDto } from './dto/review-edit.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Edits')
@Controller('edits')
export class EditsController {
  constructor(private readonly editsService: EditsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a pending edit for a tool' })
  @ApiResponse({ status: 201, description: 'Edit submitted' })
  async create(@Body() dto: CreateEditDto, @CurrentUser('id') userId: string) {
    return this.editsService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user\'s edits' })
  @ApiResponse({ status: 200, description: 'User\'s edits' })
  async findUserEdits(@CurrentUser('id') userId: string) {
    return this.editsService.findUserEdits(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Get('pending')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending edits (admin)' })
  @ApiQuery({ name: 'toolId', required: false, description: 'Filter by tool ID' })
  @ApiResponse({ status: 200, description: 'Pending edits list' })
  async findPending(
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('toolId') toolId?: string,
  ) {
    return this.editsService.findPending({ cursor, take, search, toolId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get edit details' })
  @ApiParam({ name: 'id', description: 'Edit ID' })
  @ApiResponse({ status: 200, description: 'Edit details' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.editsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Patch(':id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve edit and apply changes (admin)' })
  @ApiParam({ name: 'id', description: 'Edit ID' })
  @ApiResponse({ status: 200, description: 'Edit approved and applied' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewEditDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.editsService.approve(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Patch(':id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject edit (admin)' })
  @ApiParam({ name: 'id', description: 'Edit ID' })
  @ApiResponse({ status: 200, description: 'Edit rejected' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewEditDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.editsService.reject(id, dto, userId);
  }
}
