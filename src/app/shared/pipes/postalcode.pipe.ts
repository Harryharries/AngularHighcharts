import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'postalCode',
})
export class PostalCodePipe implements PipeTransform {
  transform(postalCode: string): any {
    try {
      return postalCode.slice(0, 3) + ' ' + postalCode.slice(3);
    } catch (error) {
      return postalCode;
    }
  }
}
