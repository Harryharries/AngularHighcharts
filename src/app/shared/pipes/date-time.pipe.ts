import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'dateTime',
})
export class DateTimePipe implements PipeTransform {
  transform(value: string, showSeconds?: string): any {
    return value
      ? moment
          .utc(value)
          .local()
          .format('YYYY-MM-DD h:mm' + (showSeconds ? ':ss a' : ' a'))
      : '';
  }
}
