import { CallbackLite } from '@7xAPI/models';

export interface CalendarSchedulerEvent {
  id: number;
  start: Date;
  end?: Date;
  title: string;
  content?: string;
  overlap?: number;
  cssClass?: string;
  isDisabled?: boolean;
  isClickable?: boolean;
  isCancelled?: boolean;
  resizable?: {
    beforeStart?: boolean;
    afterEnd?: boolean;
  };
  draggable?: boolean;
  callbackData?: CallbackLite;
}

export type CalendarSchedulerEventStatus = 'ok' | 'warning' | 'danger';

export interface CalendarSchedulerEventAction {
  when?: 'enabled' | 'disabled' | 'cancelled';
  label: string;
  title: string;
  cssClass?: string;
  onClick(event: CalendarSchedulerEvent): void;
}
