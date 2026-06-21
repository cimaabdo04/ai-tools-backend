import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CsvImportDto } from './dto/csv-import.dto';
import { ApiImportDto } from './dto/api-import.dto';
import { slugify } from 'slugify';
import { v4 as uuid } from 'uuid';
import { ToolStatus } from '@prisma/client';

interface ImportedTool {
  name: string;
  tagline?: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  pricingType?: string;
  platforms?: string[];
  useCases?: string[];
  openSource?: boolean;
  githubUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
}

interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  errors: string[];
  tools: { name: string; slug: string; status: string }[];
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);
  private importJobs: Map<string, { status: string; progress: number; total: number; result?: ImportResult }> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async importFromCsv(dto: CsvImportDto, userId: string): Promise<ImportResult> {
    const tools = this.parseCsv(dto.csvContent);
    if (tools.length === 0) {
      throw new BadRequestException('No valid tools found in CSV content');
    }

    return this.bulkImport(tools, {
      skipDuplicates: dto.skipDuplicates ?? false,
      defaultStatus: (dto.defaultStatus as ToolStatus) || ToolStatus.PENDING_REVIEW,
      categoryId: dto.categoryId,
      userId,
    });
  }

  async importFromApi(dto: ApiImportDto, userId: string): Promise<{ jobId: string }> {
    const jobId = uuid();
    this.importJobs.set(jobId, { status: 'queued', progress: 0, total: 0 });

    this.processApiImport(jobId, dto, userId).catch((err) => {
      this.logger.error(`API import job ${jobId} failed: ${err.message}`);
      const job = this.importJobs.get(jobId);
      if (job) {
        job.status = 'failed';
      }
    });

    return { jobId };
  }

  async getJobStatus(jobId: string): Promise<{ status: string; progress: number; total: number; result?: ImportResult } | null> {
    return this.importJobs.get(jobId) || null;
  }

  async findDuplicates(tools: { name: string; websiteUrl?: string }[]): Promise<{ name: string; websiteUrl?: string; matchedTool: { id: string; name: string; slug: string } | null }[]> {
    const results: { name: string; websiteUrl?: string; matchedTool: { id: string; name: string; slug: string } | null }[] = [];

    for (const tool of tools) {
      const where: any[] = [];
      if (tool.name) {
        where.push({ name: { equals: tool.name } });
      }
      if (tool.websiteUrl) {
        where.push({ websiteUrl: tool.websiteUrl });
      }

      const match = where.length > 0
        ? await this.prisma.tool.findFirst({
            where: { OR: where },
            select: { id: true, name: true, slug: true },
          })
        : null;

      results.push({ ...tool, matchedTool: match });
    }

    return results;
  }

  private async processApiImport(jobId: string, dto: ApiImportDto, userId: string): Promise<void> {
    const job = this.importJobs.get(jobId);
    if (job) job.status = 'fetching';

    try {
      const response = await this.fetchFromApi(dto);
      job.status = 'parsing';

      const tools = this.extractToolsFromResponse(response, dto);
      if (tools.length === 0) {
        throw new BadRequestException('No tools found in API response');
      }

      job.status = 'importing';
      const result = await this.bulkImport(tools, {
        skipDuplicates: dto.skipDuplicates ?? false,
        defaultStatus: (dto.defaultStatus as ToolStatus) || ToolStatus.PENDING_REVIEW,
        categoryId: dto.categoryId,
        userId,
      });

      Object.assign(job, { status: 'completed', progress: result.total, total: result.total, result });
    } catch (err: any) {
      const j = this.importJobs.get(jobId);
      if (j) {
        j.status = 'failed';
        j.result = { total: 0, imported: 0, duplicates: 0, errors: [err.message], tools: [] };
      }
    }
  }

  private async fetchFromApi(dto: ApiImportDto): Promise<any> {
    const { sourceUrl, method = 'GET', headers } = dto;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    };

    const response = await fetch(sourceUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private extractToolsFromResponse(response: any, dto: ApiImportDto): ImportedTool[] {
    let data = response;

    if (dto.responsePath) {
      const keys = dto.responsePath.split('.');
      for (const key of keys) {
        if (data && typeof data === 'object') {
          data = data[key];
        } else {
          throw new BadRequestException(`Response path "${dto.responsePath}" not found in API response`);
        }
      }
    }

    if (!Array.isArray(data)) {
      throw new BadRequestException('API response did not return an array of tools');
    }

    const mapping = dto.fieldMapping || {};

    return data.map((item: any) => {
      const tool: ImportedTool = { name: '' };

      const reverseMap: Record<string, string> = {};
      for (const [field, apiField] of Object.entries(mapping)) {
        reverseMap[apiField] = field;
      }

      for (const [key, value] of Object.entries(item)) {
        const mappedField = reverseMap[key] || key;
        if (typeof value === 'string' || typeof value === 'boolean' || Array.isArray(value)) {
          (tool as any)[mappedField] = value;
        }
      }

      if (Array.isArray(item.tags)) tool.useCases = item.tags;
      if (Array.isArray(item.categories) && !tool.useCases) tool.useCases = item.categories;

      return tool;
    }).filter((t: ImportedTool) => t.name);
  }

  private parseCsv(csvContent: string): ImportedTool[] {
    const lines = csvContent.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      throw new BadRequestException('CSV must have a header row and at least one data row');
    }

    const headers = this.parseCsvLine(lines[0]);
    const tools: ImportedTool[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCsvLine(lines[i]);
        const tool: ImportedTool = { name: '' };

        for (let j = 0; j < headers.length; j++) {
          const value = values[j] || '';
          const header = headers[j].toLowerCase().trim();

          switch (header) {
            case 'name':
              tool.name = value;
              break;
            case 'tagline':
            case 'short_description':
              tool.tagline = value;
              break;
            case 'description':
            case 'long_description':
              tool.description = value;
              break;
            case 'websiteurl':
            case 'website_url':
            case 'url':
            case 'website':
              tool.websiteUrl = value;
              break;
            case 'logourl':
            case 'logo_url':
            case 'logo':
              tool.logoUrl = value;
              break;
            case 'pricingtype':
            case 'pricing_type':
              tool.pricingType = value;
              break;
            case 'platforms':
              tool.platforms = value.split(',').map((p) => p.trim()).filter(Boolean);
              break;
            case 'usecases':
            case 'use_cases':
            case 'tags':
              tool.useCases = value.split(',').map((t) => t.trim()).filter(Boolean);
              break;
            case 'opensource':
            case 'open_source':
              tool.openSource = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
              break;
            case 'githuburl':
            case 'github_url':
            case 'github':
              tool.githubUrl = value;
              break;
            case 'twitterurl':
            case 'twitter_url':
            case 'twitter':
              tool.twitterUrl = value;
              break;
            case 'discordurl':
            case 'discord_url':
            case 'discord':
              tool.discordUrl = value;
              break;
          }
        }

        if (tool.name) {
          tools.push(tool);
        }
      } catch {
        // Skip malformed rows
      }
    }

    return tools;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  private async bulkImport(
    tools: ImportedTool[],
    options: {
      skipDuplicates: boolean;
      defaultStatus: ToolStatus;
      categoryId?: string;
      userId: string;
    },
  ): Promise<ImportResult> {
    const result: ImportResult = { total: tools.length, imported: 0, duplicates: 0, errors: [], tools: [] };

    await this.prisma.$transaction(async (tx) => {
      for (const tool of tools) {
        try {
          if (!tool.name) {
            result.errors.push('Skipped tool with no name');
            continue;
          }

          if (!options.skipDuplicates) {
            const duplicate = await tx.tool.findFirst({
              where: {
                OR: [
                  { name: { equals: tool.name } },
                  ...(tool.websiteUrl ? [{ websiteUrl: tool.websiteUrl }] : []),
                ],
              },
              select: { id: true },
            });

            if (duplicate) {
              result.duplicates++;
              continue;
            }
          }

          let slug = slugify(tool.name, { lower: true, strict: true, trim: true });
          if (!slug) slug = uuid();

          const existingSlug = await tx.tool.findUnique({ where: { slug } });
          if (existingSlug) {
            slug = `${slug}-${uuid().slice(0, 8)}`;
          }

          const created = await tx.tool.create({
            data: {
              name: tool.name,
              slug,
              tagline: tool.tagline || `${tool.name} - AI Tool`,
              description: tool.description || `${tool.name} is an AI-powered tool.`,
              websiteUrl: tool.websiteUrl || `https://example.com/${slug}`,
              logoUrl: tool.logoUrl,
              pricingType: tool.pricingType,
              useCases: tool.useCases ?? [],
              platforms: tool.platforms ?? [],
              openSource: tool.openSource ?? false,
              githubUrl: tool.githubUrl,
              twitterUrl: tool.twitterUrl,
              discordUrl: tool.discordUrl,
              status: options.defaultStatus,
              authorId: options.userId,
              categoryId: options.categoryId || null,
            },
            select: { id: true, name: true, slug: true, status: true },
          });

          result.imported++;
          result.tools.push({ name: created.name, slug: created.slug, status: created.status });
        } catch (err: any) {
          result.errors.push(`Failed to import "${tool.name}": ${err.message}`);
        }
      }
    });

    return result;
  }
}
