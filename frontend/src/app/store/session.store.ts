import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';
import {DocumentAbstract} from './document/document.model';

export interface SessionState {
  loggedIn: boolean,
  sessionTimeoutIn: number,
  sessionTimeoutDuration: number,
  ui: {
    sidebarExpanded?: boolean
    sidebarWidth?: number;
    showJSONView?: boolean;
  },
  latestDocuments: DocumentAbstract[],
  recentAddresses: DocumentAbstract[]
}

export function createInitialState(): SessionState {
  return {
    loggedIn: false,
    sessionTimeoutIn: 1800,
    sessionTimeoutDuration: 1800,
    ui: {
      sidebarExpanded: true,
      sidebarWidth: 30,
      showJSONView: false
    },
    latestDocuments: [],
    recentAddresses: []
  };
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'session'})
export class SessionStore extends Store<SessionState> {

  constructor() {
    super(createInitialState());
  }

}

