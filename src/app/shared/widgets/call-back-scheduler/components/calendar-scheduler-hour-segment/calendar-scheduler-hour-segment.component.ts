import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SchedulerViewDay, SchedulerViewHourSegment } from '../../models';

@Component({
  selector: 'app-calendar-scheduler-hour-segment',
  templateUrl: './calendar-scheduler-hour-segment.component.html',
  styleUrls: ['./calendar-scheduler-hour-segment.component.scss'],
})
export class CalendarSchedulerHourSegmentComponent implements OnInit {
  @Input()
  title!: string;

  @Input()
  day!: SchedulerViewDay;

  @Input()
  segment!: SchedulerViewHourSegment;

  @Input()
  locale!: string;

  @Input()
  hourSegmentHeight!: number;

  @Input() showHour = false;

  @Input() segmentClickable = false;

  @Output() segmentClicked: EventEmitter<{ segment: SchedulerViewHourSegment }> = new EventEmitter<{
    segment: SchedulerViewHourSegment;
  }>();

  @Output() highlyOverlapedSegement: EventEmitter<any> = new EventEmitter<any>();

  highInvolvedEventsNumber = 0;
  previewEventSegment = false;

  ngOnInit(): void {
    if (this.segmentClickable && !this.segment.isDisabled) {
      if (this.segment.events.length > 0) {
        this.segment.events.forEach((event) => {
          const offset = Math.floor((+this.segment.date - +event.event.start) / 1000 / 60);
          if (Math.abs(offset) < 7.5) {
            this.segment.isDisabled = true;
            this.highInvolvedEventsNumber += 1;
            if (event.event.id === -1) {
              this.previewEventSegment = true;
            }
          }
        });
        if (this.highInvolvedEventsNumber > 1 && this.previewEventSegment) {
          this.highlyOverlapedSegement.emit(true);
        }
      }
    }
  }

  onSegmentClick(mouseEvent: MouseEvent, segment: SchedulerViewHourSegment): void {
    if (this.segmentClickable) {
      this.segmentClicked.emit({ segment });
    }
  }
}
