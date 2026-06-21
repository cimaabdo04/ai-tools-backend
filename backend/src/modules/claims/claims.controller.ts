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
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ClaimStatus } from '@prisma/client';

@ApiTags('Claims')
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a claim request for a tool' })
  @ApiResponse({ status: 201, description: 'Claim submitted' })
  async create(@Body() dto: CreateClaimDto, @CurrentUser('id') userId: string) {
    return this.claimsService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user\'s claims' })
  @ApiResponse({ status: 200, description: 'User\'s claims' })
  async findUserClaims(@CurrentUser('id') userId: string) {
    return this.claimsService.findUserClaims(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Get('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all claims with filters (admin)' })
  @ApiQuery({ name: 'status', required: false, enum: ClaimStatus })
  @ApiResponse({ status: 200, description: 'Paginated claims list' })
  async findAll(
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
    @Query('status') status?: ClaimStatus,
    @Query('search') search?: string,
  ) {
    return this.claimsService.findAll({ cursor, take, status, search });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get claim details' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim details' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Patch(':id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a claim (admin)' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim approved' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewClaimDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.claimsService.approve(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR')
  @Patch(':id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a claim (admin)' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim rejected' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewClaimDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.claimsService.reject(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'EDITOR', 'DEVELOPER', 'USER')
  @Post(':id/appeal')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Appeal a rejected claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim appealed' })
  async appeal(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.claimsService.appeal(id, userId);
  }
}
