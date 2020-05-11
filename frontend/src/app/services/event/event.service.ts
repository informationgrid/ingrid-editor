import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {filter, switchMap, take, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  // records how many components have updated the info
  observersCount$ = new BehaviorSubject(0);

  event$ = new Subject();
  eventResult$ = new Subject();

  // see: https://stackoverflow.com/questions/44572193/rxjs-request-data-from-all-subscribers-and-complete-after-theyve-all-returned
  private result: any[] = [];

  constructor() {
  }

  sendEvent(type: string): Observable<any[]> {
    this.event$.next();
    return this.receiveEventResult(type);
  }

  respondToEvent(type: string): Observable<any> {
    return this.event$.asObservable();
  }

  updateEventData(type: string, data: any) {
    this.result.push(data);
    this.observersCount$.next(this.observersCount$.value + 1);
  }

  private receiveEventResult(type: string): Observable<any[]> {
    return this.observersCount$
      .pipe(
        filter(count => (this.event$.observers.length === 0) || (count === this.event$.observers.length && count !== 0)),
        take(1),
        switchMap( () => of(this.result)),
        tap(() => this.resetEvent(type))
      );
  }

  private resetEvent(type: string) {
    this.observersCount$.next(0);
    this.result = [];
  }
}
