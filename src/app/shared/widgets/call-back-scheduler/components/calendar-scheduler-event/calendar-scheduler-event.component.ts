import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { SchedulerViewDay, CalendarSchedulerEvent, SchedulerViewEvent } from '../../models';

import momentImported from 'moment';
import { CallbackLite } from '@7xAPI/models';
const moment = momentImported;

@Component({
  selector: 'app-calendar-scheduler-event',
  templateUrl: './calendar-scheduler-event.component.html',
  styleUrls: ['./calendar-scheduler-event.component.scss'],
})
export class CalendarSchedulerEventComponent implements OnInit {
  @Input() day: SchedulerViewDay;

  @Input() event: SchedulerViewEvent;

  @Input() container: HTMLElement;
  @Input() displayEventDetails = true;
  @Output() eventClicked: EventEmitter<{ event: CalendarSchedulerEvent }> = new EventEmitter<{
    event: CalendarSchedulerEvent;
  }>();

  callback: CallbackLite;
  start: string;
  end: string;
  tooltip;
  displayDetail: boolean;

  constructor() {}

  public ngOnInit(): void {
    this.callback = this.event?.event?.callbackData;
    this.start = moment(this.event.event.start).format('LT');
    this.end = moment(this.event.event.end).format('LT');
    this.displayDetail = this.displayEventDetails || this.event.event.id === -1;
    this.tooltip = `
    Customer : ${this.event.event.title} \n
    Campaign : ${this.callback.campaignShortName}

    `;
  }

  onEventClick(event: CalendarSchedulerEvent): void {
    if (event.isClickable) {
      this.eventClicked.emit({ event });
    }
  }
}
