import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";

export interface BeforePublishData {
  errors: any[];
}

@Injectable({
  providedIn: "root",
})
export class DocEventsService {
  private beforePublish$ = new Subject<any>();

  constructor(private router: Router) {}

  beforePublish(address: boolean): Observable<BeforePublishData> {
    return this.beforePublish$.pipe(
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
    this.beforePublish$.next(validation);
  }
}
