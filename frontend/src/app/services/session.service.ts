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
