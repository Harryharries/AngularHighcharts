import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/** [TL: 2020-09-04]
 * This class provides an unsubscribe to all observables in the child class.
 * Use myObservable$.pipe(takeUntil(this.unsubscribe$))
 * this will ensure that every time the component is destroyed all associated observable streams will be unsubscribed.
 * If this isn't performed the observables will still work, however as a session lasts for several hours the hanging observables
 * will add up and slow down the application, leading to possible memory issues.
 */
@Component({
  template: '',
})
/* eslint-disable-next-line */
export abstract class BaseOnDestroy implements OnDestroy {
  protected unsubscribe$ = new Subject<void>();

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
