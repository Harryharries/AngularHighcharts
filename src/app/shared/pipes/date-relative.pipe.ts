import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'dateMonthDay',
})
export class DateMonthDayPipe implements PipeTransform {
  transform(value: string): any {
    return moment.utc(value).local().format('MMM Do');
  }
}
