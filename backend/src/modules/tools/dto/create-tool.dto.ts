import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
  IsUrl,
  IsEnum,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ToolStatus } from '@prisma/client';

export class CreateToolDto {
  @ApiProperty({ description: 'Tool name', example: 'ChatGPT' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Short tagline', example: 'AI-powered conversational assistant', maxLength: 200 })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  tagline: string;

  @ApiProperty({ description: 'Full description', example: 'ChatGPT is an AI-powered...' })
  @IsString()
  @MinLength(50)
  @MaxLength(100000)
  description: string;

  @ApiProperty({ description: 'Website URL', example: 'https://chatgpt.com' })
  @IsUrl()
  websiteUrl: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Screenshot URL' })
  @IsOptional()
  @IsUrl()
  screenshotUrl?: string;

  @ApiPropertyOptional({ description: 'Video demo URL' })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Pricing types', example: ['free', 'paid'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  pricingTypes?: string[];

  @ApiPropertyOptional({ description: 'Minimum price', example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999)
  pricingMin?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 20 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999)
  pricingMax?: number;

  @ApiPropertyOptional({ description: 'Category IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Tag IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'Features', example: ['AI-powered', 'Real-time'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  features?: string[];

  @ApiPropertyOptional({ description: 'Use cases', example: ['writing', 'coding', 'research'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  useCases?: string[];

  @ApiPropertyOptional({ description: 'Platforms', example: ['web', 'ios', 'android'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  platforms?: string[];

  @ApiPropertyOptional({ description: 'Is open source', default: false })
  @IsOptional()
  @IsBoolean()
  openSource?: boolean;

  @ApiPropertyOptional({ description: 'GitHub URL' })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional({ description: 'Twitter URL' })
  @IsOptional()
  @IsUrl()
  twitterUrl?: string;

  @ApiPropertyOptional({ description: 'Discord URL' })
  @IsOptional()
  @IsUrl()
  discordUrl?: string;

  @ApiPropertyOptional({ description: 'Status', enum: ToolStatus, default: ToolStatus.PENDING_REVIEW })
  @IsOptional()
  @IsEnum(ToolStatus)
  status?: ToolStatus;

  @ApiPropertyOptional({ description: 'SEO title' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'Arabic support level', example: 'yes', enum: ['yes', 'partial', 'no'] })
  @IsOptional()
  @IsString()
  arabicSupport?: string;

  @ApiPropertyOptional({ description: 'Pros list', example: ['Fast', 'Easy to use'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pros?: string[];

  @ApiPropertyOptional({ description: 'Cons list', example: ['Expensive', 'Limited features'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cons?: string[];

  @ApiPropertyOptional({ description: 'Badge text', example: 'الرائد الاقتصادي 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  badge?: string;

  @ApiPropertyOptional({ description: 'Highlight info box', example: 'يتفوق على GPT-5.5 في البرمجة' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  highlight?: string;

  @ApiPropertyOptional({ description: 'Stats JSON', example: '{"المعلمات":"1.6T","السياق":"1M"}' })
  @IsOptional()
  @IsString()
  stats?: string;

  @ApiPropertyOptional({ description: 'Models JSON', example: '[{"name":"Pro","specs":"1.6T"}]' })
  @IsOptional()
  @IsString()
  models?: string;

  @ApiPropertyOptional({ description: 'Gallery image URLs JSON', example: '["url1","url2"]' })
  @IsOptional()
  @IsString()
  gallery?: string;

  @ApiPropertyOptional({ description: 'Alternatives text', example: 'أهم بدائل DeepSeek...' })
  @IsOptional()
  @IsString()
  @MaxLength(100000)
  alternativesText?: string;

  @ApiPropertyOptional({ description: 'Alternative slugs', example: '["chatgpt","claude"]' })
  @IsOptional()
  @IsString()
  alternativeSlugs?: string;

  @ApiPropertyOptional({ description: 'Start steps JSON', example: '[{"title":"أنشئ حساب","desc":"قم بزيارة الموقع"}]' })
  @IsOptional()
  @IsString()
  startSteps?: string;

  @ApiPropertyOptional({ description: 'Conclusion text', example: 'DeepSeek هو الخيار الأمثل...' })
  @IsOptional()
  @IsString()
  @MaxLength(100000)
  conclusion?: string;

  @ApiPropertyOptional({ description: 'Country ISO code', example: 'CN', maxLength: 2 })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ description: 'Current version', example: 'v5 Turbo', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @ApiPropertyOptional({ description: 'Releases JSON', example: '[{"version":"v5 Turbo","date":"2026-03-15","description":"..."}]' })
  @IsOptional()
  @IsString()
  releases?: string;

  @ApiPropertyOptional({ description: 'Pricing details JSON', example: '{"flashInputMiss":"$0.14"}' })
  @IsOptional()
  @IsString()
  pricingDetails?: string;
}
