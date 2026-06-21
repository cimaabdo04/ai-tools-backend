import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: false,
      validationError: { target: false, value: false },
    });

    if (errors.length > 0) {
      const formattedErrors: Record<string, string[]> = {};

      for (const error of errors) {
        const constraints = error.constraints || {};
        const messages = Object.values(constraints);

        if (error.children && error.children.length > 0) {
          for (const child of error.children) {
            const childConstraints = child.constraints || {};
            const childKey = `${error.property}.${child.property}`;
            formattedErrors[childKey] = Object.values(childConstraints);
          }
        } else {
          formattedErrors[error.property] = messages;
        }
      }

      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
