import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallBackSchedulerComponent } from './call-back-scheduler.component';
import { MaterialModule } from '../../../shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { CalendarSchedulerUtils } from './utils/calendar-scheduler-utils.provider';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SchedulerDateFormatter, SchedulerEventTitleFormatter } from './formatters';
import { SchedulerEventTitlePipe, CalendarSchedulerDatePipe } from './pipes';
import { CalendarSchedulerHeaderComponent } from './components/calendar-scheduler-header/calendar-scheduler-header.component';
import { CalendarSchedulerHourSegmentComponent } from './components/calendar-scheduler-hour-segment/calendar-scheduler-hour-segment.component';
import { CalendarSchedulerEventComponent } from './components/calendar-scheduler-event/calendar-scheduler-event.component';
import { PipeModule } from '../../../shared/pipes/pipe.module';
import { popperVariation, TippyModule } from '@ngneat/helipopper';

@NgModule({
  declarations: [
    CallBackSchedulerComponent,
    CalendarSchedulerHeaderComponent,
    CalendarSchedulerHourSegmentComponent,
    CalendarSchedulerEventComponent,
    SchedulerEventTitlePipe,
    CalendarSchedulerDatePipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    PipeModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxMaskModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    TippyModule.forRoot({
      defaultVariation: 'popper',
      variations: {
        popper: {
          ...popperVariation,
          placement: 'bottom',
          theme: 'light',
          trigger: 'mouseenter',
          animation: 'scale',
        },
      },
    }),
  ],
  providers: [
    CalendarSchedulerUtils,
    SchedulerEventTitleFormatter,
    SchedulerEventTitlePipe,
    CalendarSchedulerDatePipe,
    SchedulerDateFormatter,
  ],
  exports: [
    CallBackSchedulerComponent,
    CalendarSchedulerEventComponent,
    CalendarSchedulerHourSegmentComponent,
    CalendarSchedulerDatePipe,
    CalendarSchedulerHeaderComponent,
  ],
})
export class CallBackSchedulerModule {}
