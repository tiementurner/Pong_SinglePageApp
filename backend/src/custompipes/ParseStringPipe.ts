import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseStringPipe implements PipeTransform {
  transform(value: any): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Validation failed: Expected a string');
    }
    return value;
  }
}
