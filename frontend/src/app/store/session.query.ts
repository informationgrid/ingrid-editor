import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { SessionStore, SessionState } from './session.store';

@Injectable({ providedIn: 'root' })
export class SessionQuery extends Query<SessionState> {

  isSidebarExpanded$ = this.select(state => state.ui.sidebarExpanded);
  sidebarWidth$ = this.select(state => state.ui.sidebarWidth);
  latestDocuments$ = this.select(state => state.latestDocuments);

  constructor(protected store: SessionStore) {
    super(store);
  }

}
