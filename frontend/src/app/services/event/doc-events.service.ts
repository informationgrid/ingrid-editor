import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { IgeDocument } from "../../models/ige-document";
import { DocumentResponse } from "../../models/document-response";

export interface BeforePublishData {
  errors: any[];
}

@Injectable({
  providedIn: "root",
})
export class DocEventsService {
  private _beforePublish$ = new Subject<any>();
  private _beforeSave$ = new Subject<void>();
  private _afterSave$ = new Subject<DocumentResponse>();
  private _afterLoadAndSet$ = new Subject<any>();

  constructor(private router: Router) {}

  beforePublish$(address: boolean): Observable<BeforePublishData> {
    return this._beforePublish$.pipe(
      filter(() => this.belongsToThisPage(address))
    );
  }

  beforeSave$(address: boolean): Observable<void> {
    return this._beforeSave$.pipe(
      filter(() => this.belongsToThisPage(address))
    );
  }

  afterSave$(address: boolean): Observable<DocumentResponse> {
    return this._afterSave$.pipe(filter(() => this.belongsToThisPage(address)));
  }

  afterLoadAndSet$(address: boolean): Observable<void> {
    return this._afterLoadAndSet$.pipe(
      filter(() => this.belongsToThisPage(address))
    );
  }

  private belongsToThisPage(address: boolean) {
    return (
      (address && this.router.url.indexOf("/address") === 0) ||
      (!address && this.router.url.indexOf("/form") === 0)
    );
  }

  sendBeforePublish(validation: BeforePublishData) {
    this._beforePublish$.next(validation);
  }

  sendBeforeSave() {
    this._beforeSave$.next();
  }

  sendAfterSave(data: DocumentResponse) {
    this._afterSave$.next(data);
  }

  sendAfterLoadAndSet(data: DocumentResponse) {
    this._afterSave$.next(data);
  }
}
