import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhonePipe } from './phone.pipe';
import { PostalCodePipe } from './postalcode.pipe';
import { SafeUrlPipe } from './safe-url.pipe';
import { MomentLocalPipe } from './moment-local.pipe';
import { DateTimePipe } from '../../shared/pipes/date-time.pipe';
import { TimePipe } from '../../shared/pipes/time.pipe';
import { DatePipe } from '../../shared/pipes/date.pipe';
import { DateMonthDayPipe } from './date-relative.pipe';

@NgModule({
  declarations: [
    PhonePipe,
    PostalCodePipe,
    SafeUrlPipe,
    MomentLocalPipe,
    DatePipe,
    DateTimePipe,
    TimePipe,
    DateMonthDayPipe,
  ],
  imports: [CommonModule],
  exports: [
    PhonePipe,
    PostalCodePipe,
    SafeUrlPipe,
    MomentLocalPipe,
    DatePipe,
    DateTimePipe,
    TimePipe,
    DateMonthDayPipe,
  ],
})
export class PipeModule {}
