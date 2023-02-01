import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(value: string, showSeconds?: string): any {
    return moment
      .utc(value)
      .local()
      .format('h:mm' + (showSeconds ? ':ssa' : 'a'));
  }
}
