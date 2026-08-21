import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Recusa anos maiores que o ano corrente.
 *
 * O limite e lido a cada validacao, e nao na carga do modulo, para acompanhar
 * a virada de ano sem exigir restart da API.
 */
export function IsNotFutureYear(options?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isNotFutureYear',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'number' && value <= new Date().getFullYear();
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} não pode ser maior que ${new Date().getFullYear()}`;
        },
      },
    });
  };
}
