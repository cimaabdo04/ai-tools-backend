import {
  Controller,
  Get,
  Param,
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
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Public()
  @Get('for-tool/:toolId')
  @ApiOperation({ summary: 'Similar tools based on category + tags' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of recommendations' })
  @ApiResponse({ status: 200, description: 'Similar tools' })
  async forTool(
    @Param('toolId', ParseUUIDPipe) toolId: string,
    @Query('take') take?: number,
  ) {
    return this.recommendationsService.forTool(toolId, take || 6);
  }

  @Public()
  @Get('for-user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Personalized recommendations based on bookmarks/reviews' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of recommendations' })
  @ApiResponse({ status: 200, description: 'Personalized recommendations' })
  async forUser(
    @CurrentUser('id') userId: string | undefined,
    @Query('take') take?: number,
  ) {
    if (!userId) {
      return this.recommendationsService.trending(take || 10);
    }
    return this.recommendationsService.forUser(userId, take || 10);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Trending tools based on recent views/clicks (7 days)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of trending tools' })
  @ApiResponse({ status: 200, description: 'Trending tools' })
  async trending(@Query('take') take?: number) {
    return this.recommendationsService.trending(take || 10);
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'All-time popular tools' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of popular tools' })
  @ApiResponse({ status: 200, description: 'Popular tools' })
  async popular(@Query('take') take?: number) {
    return this.recommendationsService.popular(take || 10);
  }
}
