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
import { Route, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { SessionStore } from "../store/session.store";
import { ConfigService } from "../services/config/config.service";
import { routes } from "../app.router";

@Injectable({
  providedIn: "root",
})
export class MainMenuService {
  private _mainRoutes = routes;

  menu$ = new BehaviorSubject<Route[]>(this.mainRoutes);

  constructor(
    private router: Router,
    private sessionStore: SessionStore,
    private config: ConfigService,
  ) {}

  get mainRoutes(): Route[] {
    return this._mainRoutes[0].children.filter(
      (item) =>
        item.path !== "" &&
        !item.data?.hideFromMenu &&
        (!item.data?.featureFlag ||
          this.config.hasFlags(item.data?.featureFlag)),
    );
  }

  addMenuItem(label: string, path: string, component: any) {
    const routerConfig = this.router.config;
    routerConfig.push({ path: path, component: component });
    this._mainRoutes.push({ data: { title: label }, path: "/" + path });
    this.menu$.next(null);
  }

  removeMenuItem(path: string) {
    let indexToRemove = this.router.config.findIndex(
      (item: any) => item.path === path,
    );
    this.router.config.splice(indexToRemove, 1);

    indexToRemove = this._mainRoutes.findIndex(
      (item: any) => item.path === path,
    );
    this._mainRoutes.splice(indexToRemove, 1);

    this.menu$.next(null);
  }

  toggleSidebar(setExpanded: boolean) {
    this.sessionStore.update((state) => ({
      ui: {
        ...state.ui,
        sidebarExpanded: setExpanded,
      },
    }));
  }
}
