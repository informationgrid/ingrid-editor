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
import { inject, Injectable } from "@angular/core";
import { Route } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { ConfigService } from "../services/config/config.service";
import { routes } from "../app.router";
import { UiStore } from "../store/ui.store";

@Injectable({
  providedIn: "root",
})
export class MainMenuService {
  private uiStore = inject(UiStore);
  private _mainRoutes = routes;

  menu$ = new BehaviorSubject<Route[]>(this.mainRoutes);

  constructor(private config: ConfigService) {}

  get mainRoutes(): Route[] {
    return this._mainRoutes[0].children.filter(
      (item) =>
        item.path !== "" &&
        !item.data?.hideFromMenu &&
        (!item.data?.featureFlag ||
          this.config.hasFlags(item.data?.featureFlag)),
    );
  }

  toggleSidebar(setExpanded: boolean) {
    this.uiStore.setSidebarExpanded(setExpanded);
  }
}
