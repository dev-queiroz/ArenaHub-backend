import { PartialType } from '@nestjs/swagger';
import { CreateCourtDto } from './create-court.dto';

/**
 * DTO for updating an existing court.
 * All fields are optional (partial update).
 */
export class UpdateCourtDto extends PartialType(CreateCourtDto) {}
