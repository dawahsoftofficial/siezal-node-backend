// exceptions/app.exception.ts
/**
 * Example custom exception for handling unique constraint violations (e.g., duplicate entries).
 * Extend NestJS built-in exceptions for specific business logic.
 *
 * Usage:
 *   throw new UniqueConstraintException('Email already exists');
 */
import { ConflictException } from '@nestjs/common';

/**
 * Thrown when a unique constraint is violated (e.g., duplicate entry in DB).
 */
export class UniqueConstraintException extends ConflictException {
  constructor(message: string = 'Duplicate entry found') {
    super(message);
  }
}
