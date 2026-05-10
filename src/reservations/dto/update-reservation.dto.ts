import { PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto';

/**
 * DTO for updating an existing reservation.
 * All fields are optional (partial update).
 */
export class UpdateReservationDto extends PartialType(CreateReservationDto) {}
