import { Injectable } from "@angular/core";
import { Query } from "@datorama/akita";
import { SessionState, SessionStore } from "./session.store";
import { DocumentAbstract } from "./document/document.model";

@Injectable({ providedIn: "root" })
export class SessionQuery extends Query<SessionState> {
  isSidebarExpanded$ = this.select((state) => state.ui.sidebarExpanded);
  sidebarWidth$ = this.select((state) => state.ui.sidebarWidth);
  userTableWidth$ = this.select((state) => state.ui.userTableWidth);
  latestDocuments$ = this.select((state) => state.latestDocuments);
  latestPublishedDocuments$ = this.select(
    (state) => state.latestPublishedDocuments
  );
  oldestExpiredDocuments$ = this.select(
    (state) => state.oldestExpiredDocuments
  );
  latestAddresses$ = this.select((state) => state.latestAddresses);
  recentAddresses$ = this.select((state) => state.recentAddresses);
  showJSONView$ = this.select((state) => state.ui.showJSONView);
  selectServerValidationErrors$ = this.select(
    (state) => state.serverValidationErrors
  );

  constructor(protected store: SessionStore) {
    super(store);
  }

  get recentAddresses(): { [catalogId: string]: DocumentAbstract[] } {
    return this.getValue().recentAddresses;
  }
}
