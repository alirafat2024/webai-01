import { PartialType } from '@nestjs/mapped-types';
import { CreateGetProjectDto } from './create-get-project.dto.js';

export class UpdateGetProjectDto extends PartialType(CreateGetProjectDto) {}
