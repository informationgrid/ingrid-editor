import { Injectable } from "@angular/core";
import { Store, StoreConfig } from "@datorama/akita";
import { DocumentAbstract } from "./document/document.model";

export interface SessionState {
  loggedIn: boolean;
  sessionTimeoutIn: number;
  sessionTimeoutDuration: number;
  ui: {
    sidebarExpanded?: boolean;
    sidebarWidth?: number;
    showJSONView?: boolean;
    userTableWidth?: number;
  };
  latestDocuments: DocumentAbstract[];
  recentAddresses: DocumentAbstract[];
  serverValidationErrors: ValidationError[];
}

export interface ValidationError {
  key: string;
  messages: { [x: string]: { message: string } }[];
}

export function createInitialState(): SessionState {
  return {
    loggedIn: false,
    sessionTimeoutIn: 1800,
    sessionTimeoutDuration: 1800,
    ui: {
      sidebarExpanded: true,
      sidebarWidth: 30,
      showJSONView: false,
      userTableWidth: 30,
    },
    latestDocuments: [],
    recentAddresses: [],
    serverValidationErrors: [],
  };
}

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "session" })
export class SessionStore extends Store<SessionState> {
  constructor() {
    super(createInitialState());
  }
}
