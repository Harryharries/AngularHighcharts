import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { SchedulerViewDay } from '../../models';

@Component({
  selector: 'app-calendar-scheduler-header',
  templateUrl: './calendar-scheduler-header.component.html',
  styleUrls: ['./calendar-scheduler-header.component.scss'],
})
export class CalendarSchedulerHeaderComponent implements OnInit {
  @Input() days: SchedulerViewDay[] | undefined;

  @Input() locale: string | undefined;

  @Output() dayHeaderClicked: EventEmitter<{ day: SchedulerViewDay }> = new EventEmitter<{ day: SchedulerViewDay }>();

  ngOnInit(): void {}

  onDayHeaderClick(mouseEvent: MouseEvent, day: SchedulerViewDay): void {
    if (mouseEvent.stopPropagation) {
      mouseEvent.stopPropagation();
    }

    this.dayHeaderClicked.emit({ day });
  }
}
