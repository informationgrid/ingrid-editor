/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { effect, inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { ConfigService } from "./config/config.service";
import { UiStore } from "../store/ui.store";

// the values must match with the actual route!
export type TabPage =
  | "research"
  | "manage"
  | "importExport"
  | "catalogs"
  | "reports";

export interface Tab {
  label: string;
  path: string;
  params?: string;
}

@Injectable({
  providedIn: "root",
})
export class SessionService {
  private uiStore = inject(UiStore);
  constructor(private configService: ConfigService) {
    effect(() => {
      this.saveToLocalStorage(
        "sidebarExpanded",
        this.uiStore.sidebarExpanded(),
      );
    });
    effect(() => {
      const value = this.uiStore.textAreaHeights();
      if (Object.keys(value).length === 0) return;
      this.saveToLocalStorage("textAreaHeights", JSON.stringify(value));
    });
  }

  updateCurrentSubpage(page: TabPage, subPage: string | { id: string }) {
    const newTabState = {};
    newTabState[page] = subPage;
    this.uiStore.updateCurrentSubpage(newTabState);
  }

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

  private saveToLocalStorage(key: string, value: any) {
    localStorage.setItem(key, value);
  }
}
