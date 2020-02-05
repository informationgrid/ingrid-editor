import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { SessionStore, SessionState } from './session.store';

@Injectable({ providedIn: 'root' })
export class SessionQuery extends Query<SessionState> {

  isLoggedIn$ = this.select(state => state.loggedIn);
  isProfilesInitialized$ = this.select(state => state.profilesInitialized);
  isSidebarExpanded$ = this.select(state => state.ui.sidebarExpanded);
  latestDocuments$ = this.select(state => state.latestDocuments);

  constructor(protected store: SessionStore) {
    super(store);
  }

}
