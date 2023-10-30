import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { IgeDocument } from "../../models/ige-document";
import { ConfigService } from "../config/config.service";

export interface BeforePublishData {
  errors: any[];
}

export interface ErrorWithHandled {
  errorCode: string;
  response: {
    handled: boolean;
  };
}

export interface DocEvent {
  type: string;
  data?: any;
}

@Injectable({
  providedIn: "root",
})
export class DocEventsService {
  private _beforePublish$ = new Subject<any>();
  private _beforeSave$ = new Subject<void>();
  private _afterSave$ = new Subject<any>();
  private _afterLoadAndSet$ = new Subject<any>();

  private _onError$ = new Subject<ErrorWithHandled>();
  private _event = new Subject<DocEvent>();

  constructor(private router: Router) {}

  beforePublish$(address: boolean): Observable<BeforePublishData> {
    return this._beforePublish$.pipe(
      filter(() => this.belongsToThisPage(address)),
    );
  }

  beforeSave$(address: boolean): Observable<void> {
    return this._beforeSave$.pipe(
      filter(() => this.belongsToThisPage(address)),
    );
  }

  afterSave$(address: boolean): Observable<IgeDocument> {
    return this._afterSave$.pipe(filter(() => this.belongsToThisPage(address)));
  }

  afterLoadAndSet$(address: boolean): Observable<IgeDocument> {
    return this._afterLoadAndSet$.pipe(
      filter(() => this.belongsToThisPage(address)),
    );
  }

  private belongsToThisPage(address: boolean) {
    return (
      (address &&
        this.router.url.indexOf(`/${ConfigService.catalogId}/address`) === 0) ||
      (!address &&
        this.router.url.indexOf(`/${ConfigService.catalogId}/form`) === 0)
    );
  }

  sendBeforePublish(validation: BeforePublishData) {
    this._beforePublish$.next(validation);
  }

  sendBeforeSave() {
    this._beforeSave$.next();
  }

  sendAfterSave(data: IgeDocument) {
    this._afterSave$.next(data);
  }

  sendAfterLoadAndSet(data: IgeDocument) {
    this._afterLoadAndSet$.next(data);
  }

  sendOnError(errorCode: string) {
    const response = { handled: false };
    this._onError$.next({ errorCode: errorCode, response: response });
    return response.handled;
  }

  onError(address: boolean) {
    return this._onError$.pipe(filter(() => this.belongsToThisPage(address)));
  }

  sendEvent(event: DocEvent) {
    this._event.next(event);
  }

  onEvent(type: string) {
    return this._event.pipe(filter((eventItem) => eventItem.type === type));
  }
}
