import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { WeekViewHour } from 'calendar-utils';
import { BaseOnDestroy } from '../../components/base-on-destroy/base-on-destroy';
import {
  CalendarSchedulerEvent,
  SchedulerView,
  SchedulerViewDay,
  SchedulerViewHour,
  SchedulerViewHourSegment,
} from './models';
import { MINUTES_IN_HOUR, Time } from './utils/calendar-scheduler-utils';
import { CalendarSchedulerUtils } from './utils/calendar-scheduler-utils.provider';
import { Subject, Subscription } from 'rxjs';
import { UtilityService } from '../../services/utility.service';
import { takeUntil, debounceTime } from 'rxjs/operators';
import * as moment from 'moment'


@Component({
  selector: 'app-call-back-scheduler',
  templateUrl: './call-back-scheduler.component.html',
  styleUrls: ['./call-back-scheduler.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallBackSchedulerComponent extends BaseOnDestroy implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() refresh: Subject<any> = new Subject();
  @Input() open: boolean = true;
  @Input() dayStartHour = 0;
  @Input() dayStartMinute = 0;
  @Input() dayEndHour = 23;
  @Input() dayEndMinute = 59;
  @Input() hourSegments: 1 | 2 | 4 | 6 | 12 | 60 = 4;
  @Input() weekendDays: number[] = [];
  @Input() viewDate = new Date();
  @Input() viewDays = 7;
  @Input() weekStartsOn = 1;
  @Input() excludeDays: number[] = [];
  @Input() startsWithToday = false;
  @Input() displayEventDetails = true;
  @Input() hourSegmentHeight = 16;
  @Input() events: CalendarSchedulerEvent[] = [];
  @Input() showSegmentHour = false;
  @Input() segmentClickable = false;
  @Output() eventClicked: EventEmitter<{ event: CalendarSchedulerEvent }> = new EventEmitter<{
    event: CalendarSchedulerEvent;
  }>();
  @Output() dayHeaderClicked: EventEmitter<{ day: SchedulerViewDay }> = new EventEmitter<{ day: SchedulerViewDay }>();
  @Output() segmentClicked: EventEmitter<{ segment: SchedulerViewHourSegment }> = new EventEmitter<{
    segment: SchedulerViewHourSegment;
  }>();
  @Output() previewEventHighlyOverlaped: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('calendarContainer') calendarContainer: ElementRef<HTMLTextAreaElement> | undefined;

  hours: WeekViewHour[] = [];
  days: SchedulerViewDay[] = [];
  view: SchedulerView | undefined;
  resizes: Map<CalendarSchedulerEvent, ResizeEvent> = new Map();
  dayColumnWidth: number | undefined;
  refreshSubscription: Subscription = new Subscription;
  timeControlInterval: NodeJS.Timeout | undefined;
  timelineTop: number | undefined;

  validateResize: ((args: any) => boolean) | undefined;
  UtilityService = UtilityService;

  constructor(
    private utils: CalendarSchedulerUtils,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }
  ngOnInit(): void {
    this.timelineTop = this.calculateTimelineTop();

    this.refreshSubscription = this.refresh.pipe(debounceTime(0), takeUntil(this.unsubscribe$)).subscribe(() => {
      if (this.open) {
        this.open = false;
        const div = document.getElementById('calender-body');
        if (div && this.timelineTop) {
          div.scrollTop = this.timelineTop - 300;
        }
      }
      this.cd.detectChanges();
    });
    if (this.open) {
      this.refreshAll();
      this.listenToTimeChanges();
    }
  }

  /**
   * Runs every 1 second and checks if today's minutes changed
   * if time(minutes) changed, move the timeline postion
   */
  listenToTimeChanges() {
    this.timeControlInterval = setInterval(() => {
      if (this.timelineTop !== this.calculateTimelineTop()) {
        this.timelineTop = this.calculateTimelineTop();
        this.cd.detectChanges();
      }
    }, 1000);
  }

  calculateTimelineTop(): number {
    const hourHeightModifier: number =
      (this.hourSegments * this.hourSegmentHeight + this.hourSegments / 2 - 0.2) / MINUTES_IN_HOUR;
    const dayMinutes = moment.duration(moment().diff(moment().startOf('day'))).asMinutes();
    return Math.floor(hourHeightModifier * dayMinutes);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewDays'] || changes['viewDate'] || changes['excludeDays'] || changes['weekendDays']) {
      this.refreshHeader();
    }

    if (
      changes['viewDays'] ||
      changes['viewDate'] ||
      changes['events'] ||
      changes['dayStartHour'] ||
      changes['dayEndHour'] ||
      changes['dayStartMinute'] ||
      changes['dayEndMinute'] ||
      changes['excludeDays'] ||
      changes['eventWidth']
    ) {
      this.refreshHourGrid();
      this.refreshBody();
    }
    this.refresh.next(true);
  }

  private refreshAll(): void {
    this.refreshHeader();
    this.refreshHourGrid();
    this.refreshBody();
    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
      if (this.calendarContainer) {
          this.calendarContainer.nativeElement.style.maxHeight = '58vh';
        }
  }

  override ngOnDestroy(): void {
    clearInterval(this.timeControlInterval);
    super.ngOnDestroy();
  }

  viewDaysChanged(): void {
    this.viewDays = 7;
    this.refreshAll();
  }

  segmentClickedEmit($event: any): void {
    this.segmentClicked.emit($event.segment);
  }

  previewEventHighlyOverlapedEmit($event: { segment: any; }): void {
    this.previewEventHighlyOverlaped.emit($event.segment);
  }

  private refreshBody(events?: CalendarSchedulerEvent[]): void {
    this.view = this.getSchedulerView(events || this.events);

    this.view.days.forEach((day) => {
      day.hours.forEach((hour: SchedulerViewHour) => {
        hour.segments.forEach((segment: SchedulerViewHourSegment) => {
          segment.isDisabled = !this.isDateValid(segment.date);
        });
      });
    });
    this.events?.forEach((event, index) => {
      event.isDisabled = !this.isDateValid(event.start);
      if (index === this.events.length - 1) {
        this.refresh.next(true);
      }
    });
  }

  private getSchedulerView(events: CalendarSchedulerEvent[]): SchedulerView {
    return this.utils.getSchedulerView({
      events,
      viewDate: this.viewDate,
      viewDays: this.viewDays,
      hourSegments: this.hourSegments,
      weekStartsOn: this.weekStartsOn,
      startsWithToday: this.startsWithToday,
      dayStart: {
        hour: this.dayStartHour,
        minute: this.dayStartMinute,
      } as Time,
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute,
      } as Time,
      excluded: this.excludeDays,
      eventWidth: 1,
      hourSegmentHeight: this.hourSegmentHeight,
      logEnabled: false,
    });
  }

  private refreshHourGrid(): void {
    this.hours = this.utils.getSchedulerViewHourGrid({
      viewDate: this.viewDate,
      hourSegments: this.hourSegments,
      dayStart: {
        hour: this.dayStartHour,
        minute: this.dayStartMinute,
      },
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute,
      },
    });
  }

  private refreshHeader(): void {
    this.days = this.utils.getSchedulerViewDays({
      viewDate: this.viewDate,
      viewDays: this.viewDays,
      weekStartsOn: this.weekStartsOn,
      startsWithToday: this.startsWithToday,
      excluded: this.excludeDays,
      weekendDays: this.weekendDays,
    });
  }

  private isDateValid(date: Date): boolean {
    return !moment(date).isBefore(moment());
  }
}
