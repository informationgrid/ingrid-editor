import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { filter, map, switchMap, take, tap } from "rxjs/operators";

export enum IgeEvent {
  DELETE = "DELETE",
  DELETE_USER = "DELETE_USER",
}

export enum IgeEventResultType {
  SUCCESS,
  FAIL,
}

export interface EventData {
  result: IgeEventResultType;
  data: any;
}

export type EventResponder = {
  data: any;
  eventResponseHandler: EventResponseHandler;
};
export type EventResponseHandler = (data: EventData) => void;

/**
 * This service provides a functionality to send an event and wait for the responses of all
 * subscribers of this event. If no one is subscribed to the event, the sender of the event
 * can continue.
 *
 * The idea of this event system comes from:
 * https://stackoverflow.com/questions/44572193/rxjs-request-data-from-all-subscribers-and-complete-after-theyve-all-returned
 */
@Injectable({
  providedIn: "root",
})
export class EventService {
  // records how many components have updated the info for an event type
  private observersCount$: { [x: string]: BehaviorSubject<any> } = {};

  // this is the event a consumer can subscribe to
  private event$: { [x: string]: Subject<any> } = {};

  // this contains the results of an event type
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

  /**
   * Send a defined event and return a new observable which waits for the results.
   * @param type defines the Event Type
   * @param data used to send additional data to the subscribers
   */
  sendEvent(type: IgeEvent, data: any = null): Observable<EventData[]> {
    this.event$[type].next(data);
    return this.receiveEventResult(type);
  }

  /**
   * Check if the event has observers
   * @param type
   */
  eventIsObserved(type: IgeEvent): boolean {
    return this.event$[type].observed;
  }

  /**
   * This is a convenience method send an event and only notify the sender if
   * all responses were tagged successful.
   *
   * @param type defines the Event Type
   * @param data used to send additional data to the subscribers
   */
  sendEventAndContinueOnSuccess(
    type: IgeEvent,
    data: any = null
  ): Observable<EventData[]> {
    return this.sendEvent(type, data).pipe(
      filter((responses) => this.allResponsesSuccessful(type, responses))
    );
  }

  /**
   * If someone wants to react on an event then it has to subscribe to this function.
   * On an event it will receive a function where the consumer can send the result.
   *
   * @param type defines the Event Type
   */
  respondToEvent(type: IgeEvent): Observable<EventResponder> {
    return this.event$[type].asObservable().pipe(
      map((data) => {
        return {
          data,
          eventResponseHandler: (eventData) =>
            this.updateEventData(type, eventData),
        };
      })
    );
  }

  private allResponsesSuccessful(type: IgeEvent, responses: EventData[]) {
    const isSuccessful = responses.every(
      (item) => item.result === IgeEventResultType.SUCCESS
    );
    if (!isSuccessful) {
      console.log(
        "One subscriber prevented to run original method for: " + type,
        responses
      );
    }
    return isSuccessful;
  }

  private updateEventData(type: IgeEvent, data: EventData) {
    this.result[type].push(data);
    this.observersCount$[type].next(this.observersCount$[type].value + 1);
  }

  private receiveEventResult(type: IgeEvent): Observable<EventData[]> {
    return this.observersCount$[type].pipe(
      filter((count) => this.allSubscribersHaveFinished(type, count)),
      take(1),
      switchMap(() => of(this.result[type])),
      tap(() => this.resetEvent(type))
    );
  }

  private allSubscribersHaveFinished(type: IgeEvent, count): boolean {
    return (
      this.event$[type].observers.length === 0 ||
      (count === this.event$[type].observers.length && count !== 0)
    );
  }

  private resetEvent(type: IgeEvent) {
    this.observersCount$[type].next(0);
    this.result[type] = [];
  }
}
