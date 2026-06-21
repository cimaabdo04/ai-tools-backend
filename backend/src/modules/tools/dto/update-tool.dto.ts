import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateToolDto } from './create-tool.dto';

export class UpdateToolDto extends PartialType(
  OmitType(CreateToolDto, ['status'] as const),
) {}
