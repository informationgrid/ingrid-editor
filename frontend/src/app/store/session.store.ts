import { Injectable } from "@angular/core";
import { Store, StoreConfig } from "@datorama/akita";
import { DocumentAbstract } from "./document/document.model";

export interface SessionState {
  loggedIn: boolean;
  sessionTimeoutIn: number;
  sessionTimeoutDuration: number;
  ui: {
    textAreaHeights: any;
    sidebarExpanded?: boolean;
    sidebarWidth?: number;
    showJSONView?: boolean;
    userTableWidth?: number;
    toggleFieldsButtonShowAll?: boolean;
    currentTab: {
      research: string;
      manage: string;
      importExport: string;
      catalogs: string;
    };
  };
  latestDocuments: DocumentAbstract[];
  latestAddresses: DocumentAbstract[];
  recentAddresses: { [catalogId: string]: DocumentAbstract[] };
  latestPublishedDocuments: DocumentAbstract[];
  oldestExpiredDocuments: DocumentAbstract[];
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
      textAreaHeights: {},
      sidebarExpanded: true,
      sidebarWidth: 30,
      showJSONView: false,
      userTableWidth: 35,
      toggleFieldsButtonShowAll: false,
      currentTab: {
        research: null,
        manage: null,
        importExport: null,
        catalogs: null,
      },
    },
    latestDocuments: [],
    latestAddresses: [],
    latestPublishedDocuments: [],
    oldestExpiredDocuments: [],
    recentAddresses: {},
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
