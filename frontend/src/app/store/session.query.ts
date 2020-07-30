import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { SessionStore, SessionState } from './session.store';
import {DocumentAbstract} from "./document/document.model";

@Injectable({ providedIn: 'root' })
export class SessionQuery extends Query<SessionState> {

  isSidebarExpanded$ = this.select(state => state.ui.sidebarExpanded);
  sidebarWidth$ = this.select(state => state.ui.sidebarWidth);
  latestDocuments$ = this.select(state => state.latestDocuments);
  recentAddresses$ = this.select(state => state.recentAddresses);
  showJSONView$ = this.select(state => state.ui.showJSONView);

  constructor(protected store: SessionStore) {
    super(store);
  }

    get recentAddresses(): DocumentAbstract[] {
     return this.getValue().recentAddresses;
   }

}
