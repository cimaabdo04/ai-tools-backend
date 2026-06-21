import {
  Controller,
  Get,
  Post,
  Put,
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
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('tool/:toolId')
  @ApiOperation({ summary: 'Get reviews for a tool (public, paginated)' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiResponse({ status: 200, description: 'Paginated reviews for tool' })
  async findByTool(
    @Param('toolId', ParseUUIDPipe) toolId: string,
    @Query() query: ReviewQueryDto,
  ) {
    return this.reviewsService.findByTool(toolId, query);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reviews by a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Reviews by user' })
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review (authenticated, unique per user+tool)' })
  @ApiResponse({ status: 201, description: 'Review created' })
  @ApiResponse({ status: 409, description: 'Already reviewed this tool' })
  async create(@Body() dto: CreateReviewDto, @CurrentUser('id') userId: string) {
    const data = await this.reviewsService.create(dto, userId);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated' })
  @ApiResponse({ status: 403, description: 'Not your review' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.reviewsService.update(id, dto, userId);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 204, description: 'Review deleted' })
  @ApiResponse({ status: 403, description: 'Not your review' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.reviewsService.remove(id, userId);
  }

  @Public()
  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark review as helpful' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Marked as helpful' })
  async markHelpful(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.reviewsService.markHelpful(id);
    return { data };
  }
}
