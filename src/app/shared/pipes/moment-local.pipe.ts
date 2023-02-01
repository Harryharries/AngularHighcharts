import { Pipe, PipeTransform } from '@angular/core';
import moment, { Moment } from 'moment';

@Pipe({
  name: 'momentLocal',
})
export class MomentLocalPipe implements PipeTransform {
  transform(value: Moment): any {
    return moment.utc(value).local();
  }
}
