import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'date',
})
export class DatePipe implements PipeTransform {
  transform(value: string): any {
    return moment.utc(value).local().format('YYYY-MM-DD');
  }
}
