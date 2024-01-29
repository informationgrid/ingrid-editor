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
import { SessionStore } from "../store/session.store";
import { SessionQuery } from "../store/session.query";
import { Observable } from "rxjs";
import { ActivatedRouteSnapshot } from "@angular/router";
import { ConfigService } from "./config/config.service";

// the values must match with the actual route!
export type TabPage = "research" | "manage" | "importExport" | "catalogs";

export interface Tab {
  label: string;
  path: string;
  params?: string;
}

@Injectable({
  providedIn: "root",
})
export class SessionService {
  constructor(
    private sessionStore: SessionStore,
    private sessionQuery: SessionQuery,
    private configService: ConfigService,
  ) {}

  updateCurrentTab(page: TabPage, tabIndex: string) {
    this.sessionStore.update((state) => {
      const newTabState = {};
      newTabState[page] = tabIndex;
      return {
        ...state,
        ui: {
          ...state.ui,
          currentTab: {
            ...state.ui.currentTab,
            ...newTabState,
          },
        },
      };
    });
  }

  observeTabChange(page: TabPage): Observable<string> {
    return this.sessionQuery.select((state) => state.ui.currentTab[page]);
  }

  /*getCurrentTab(page: TabPage): number {
    return this.sessionQuery.getValue().ui.currentTab[page];
  }*/

  getTabsFromRoute(activeRoute: ActivatedRouteSnapshot): Tab[] {
    return activeRoute.routeConfig.children
      .filter((item) => item.path)
      .filter((item) => this.configService.hasPermission(item.data?.permission))
      .map((item) => ({
        label: item.data.title,
        path: item.path,
      }));
  }

  getTabPaths(activeRoute: ActivatedRouteSnapshot) {
    return activeRoute.routeConfig.children
      .filter((item) => item.path)
      .map((item) => item.path);
  }
}
