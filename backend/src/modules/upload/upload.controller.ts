import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, basename } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];

function sanitizeFilename(filename: string): string {
  const safe = basename(filename);
  if (safe !== filename || safe.includes('..')) {
    throw new BadRequestException('Invalid filename');
  }
  return safe;
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Public()
  @Get(':filename')
  @ApiOperation({ summary: 'Serve uploaded file' })
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const safe = sanitizeFilename(filename);
    const filePath = join(process.cwd(), 'uploads', safe);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    res.sendFile(filePath);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, join(process.cwd(), 'uploads'));
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${uuid()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
        }
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return cb(new BadRequestException(`File extension ${ext} is not allowed`), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
    async uploadFile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/api/v1/upload/${file.filename}`;
    return { url };
  }

  @Delete(':filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an uploaded file (Authenticated)' })
  deleteFile(@Param('filename') filename: string) {
    const safe = sanitizeFilename(filename);
    const filePath = join(process.cwd(), 'uploads', safe);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    try {
      unlinkSync(filePath);
      return { message: 'File deleted successfully' };
    } catch {
      throw new BadRequestException('Failed to delete file');
    }
  }
}
