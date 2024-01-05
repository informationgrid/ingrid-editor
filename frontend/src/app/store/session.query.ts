/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
    (state) => state.latestPublishedDocuments,
  );
  oldestExpiredDocuments$ = this.select(
    (state) => state.oldestExpiredDocuments,
  );
  latestAddresses$ = this.select((state) => state.latestAddresses);
  recentAddresses$ = this.select((state) => state.recentAddresses);
  showJSONView$ = this.select((state) => state.ui.showJSONView);
  selectServerValidationErrors$ = this.select(
    (state) => state.serverValidationErrors,
  );

  constructor(protected store: SessionStore) {
    super(store);
  }

  get recentAddresses(): { [catalogId: string]: DocumentAbstract[] } {
    return this.getValue().recentAddresses;
  }
}
