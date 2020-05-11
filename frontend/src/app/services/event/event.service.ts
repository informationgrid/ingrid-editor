import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {filter, switchMap, take, tap} from 'rxjs/operators';

export enum IgeEvent {
  DELETE = 'DELETE'
}

export enum IgeEventResultType {
  SUCCESS, FAIL
}

export interface EventData {
  result: IgeEventResultType;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {

  // records how many components have updated the info
  observersCount$: { [x: string]: BehaviorSubject<any> } = {};

  event$: { [x: string]: Subject<any> } = {};

  // see: https://stackoverflow.com/questions/44572193/rxjs-request-data-from-all-subscribers-and-complete-after-theyve-all-returned
  private result: { [x: string]: EventData[] } = {};

  constructor() {
    for (const type in IgeEvent) {
      if (IgeEvent.hasOwnProperty(type)) {
        this.observersCount$[type] = new BehaviorSubject(0);
        this.event$[type] = new Subject();
        this.result[type] = [];
      }
    }
  }

  sendEvent(type: IgeEvent): Observable<EventData[]> {
    this.event$[type].next();
    return this.receiveEventResult(type);
  }

  sendEventAndContinueOnSuccess(type: IgeEvent): Observable<EventData[]> {
    return this.sendEvent(type)
      .pipe(
        filter(responses => this.allResponsesSuccessful(type, responses))
      );
  }

  private allResponsesSuccessful(type: IgeEvent, responses: EventData[]) {
    const isSuccessful = responses.every(item => item.result === IgeEventResultType.SUCCESS);
    if (!isSuccessful) {
      console.log('One subscriber prevented to run original method for: ' + type, responses);
    }
    return isSuccessful;
  }

  respondToEvent(type: IgeEvent): Observable<any> {
    return this.event$[type].asObservable();
  }

  updateEventData(type: IgeEvent, data: EventData) {
    this.result[type].push(data);
    this.observersCount$[type].next(this.observersCount$[type].value + 1);
  }

  private receiveEventResult(type: IgeEvent): Observable<EventData[]> {
    return this.observersCount$[type]
      .pipe(
        filter(count => this.allSubscribersHaveFinished(type, count)),
        take(1),
        switchMap(() => of(this.result[type])),
        tap(() => this.resetEvent(type))
      );
  }

  private allSubscribersHaveFinished(type: IgeEvent, count): boolean {
    return (this.event$[type].observers.length === 0) || (count === this.event$[type].observers.length && count !== 0);
  }

  private resetEvent(type: IgeEvent) {
    this.observersCount$[type].next(0);
    this.result[type] = [];
  }
}
