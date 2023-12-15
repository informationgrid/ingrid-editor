/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
  name: string;
  errorCode: string;
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
