import {Injectable} from '@angular/core';
import {Store, StoreConfig} from '@datorama/akita';

export interface SessionState {
  loggedIn: boolean,
  ui: {
    sidebarExpanded?: boolean
    sidebarWidth?: number;
  }
}

export function createInitialState(): SessionState {
  return {
    loggedIn: false,
    ui: {
      sidebarExpanded: true,
      sidebarWidth: 15
    }
  };
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'session'})
export class SessionStore extends Store<SessionState> {

  constructor() {
    super(createInitialState());
  }

}

