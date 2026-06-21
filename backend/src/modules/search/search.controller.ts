import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Full-text search with filters' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Pagination cursor' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Results per page' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category slug' })
  @ApiQuery({ name: 'tags', required: false, type: String, description: 'Filter by tag slugs (comma-separated)' })
  @ApiQuery({ name: 'pricingType', required: false, type: String, description: 'Filter by pricing type' })
  @ApiQuery({ name: 'minRating', required: false, type: Number, description: 'Minimum rating filter' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, enum: ['relevance', 'rating', 'views', 'newest'], description: 'Sort order' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @Query('q') q: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('pricingType') pricingType?: string,
    @Query('minRating') minRating?: number,
    @Query('sortBy') sortBy?: 'relevance' | 'rating' | 'views' | 'newest',
  ) {
    return this.searchService.search({
      query: q || '',
      cursor,
      take,
      category,
      tags,
      pricingType,
      minRating: minRating ? Number(minRating) : undefined,
      sortBy,
    });
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({ summary: 'Autocomplete search suggestions' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max suggestions' })
  @ApiResponse({ status: 200, description: 'Search suggestions' })
  async suggestions(@Query('q') q: string, @Query('limit') limit?: number) {
    const data = await this.searchService.getSuggestions(q || '', limit || 6);
    return { data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('reindex')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reindex search data (admin)' })
  @ApiResponse({ status: 200, description: 'Reindex complete' })
  async reindex() {
    return this.searchService.reindex();
  }
}
