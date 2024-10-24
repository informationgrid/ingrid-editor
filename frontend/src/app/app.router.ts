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
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  Route,
  RouteReuseStrategy,
  RouterModule,
  Routes,
} from "@angular/router";
import { AuthGuard } from "./security/auth.guard";
import { InitCatalogComponent } from "./init-catalog/init-catalog.component";
import { ConfigService } from "./services/config/config.service";
import { filter } from "rxjs/operators";

export const routes: Routes = [
  {
    path: ":catalog",
    component: InitCatalogComponent,
    children: [
      {
        path: "dashboard",
        loadChildren: () => import("./+dashboard/routes"),
        canActivate: [AuthGuard],
        data: {
          icon: "Uebersicht",
        },
      },
      {
        path: "form",
        loadChildren: () => import("./+form/routes"),
        canActivate: [AuthGuard],
        data: {
          icon: "Daten",
        },
      },
      {
        path: "address",
        loadChildren: () => import("./+address/routes"),
        canActivate: [AuthGuard],
        data: {
          icon: "Adressen",
        },
      },
      {
        path: "research",
        loadChildren: () => import("./+research/routes"),
        canActivate: [AuthGuard],
        data: {
          icon: "Recherche",
        },
      },
      {
        path: "reports",
        loadChildren: () =>
          import("./+reports/lazy-reports.routing").then(
            (m) => m.LazyReportsRouting,
          ),
        canActivate: [AuthGuard],
        data: {
          onlyAdmin: true,
          icon: "Reports",
        },
      },
      {
        path: "manage",
        loadChildren: () => import("./+user/routes"),
        data: {
          onlyAdmin: true,
          permission: "manage_users",
          icon: "Benutzer",
        },
      },
      // TODO: check canActivateChild: [AuthGuard],
      {
        path: "importExport",
        loadChildren: () => import("./+importExport/routes"),
        canActivate: [AuthGuard],
        data: {
          onlyAdmin: true,
          permission: ["can_import", "can_export"],
          icon: "Im-Export",
        },
      },
      {
        path: "catalogs",
        loadChildren: () => import("./+catalog/routes"),
        data: {
          onlyAdmin: true,
          permission: "manage_catalog",
          icon: "Katalog",
        },
      },
      {
        path: "settings",
        loadChildren: () => import("./+settings/routes"),
        data: {
          onlyAdmin: true,
          icon: "",
          hideFromMenu: true,
        },
      },
      {
        path: "profile",
        loadChildren: () => import("./+profile/routes"),
        data: {
          icon: "",
          hideFromMenu: true,
        },
      },
      {
        path: "logout",
        loadComponent: () =>
          import("./+logout/logout.component").then((m) => m.LogoutComponent),
        data: {
          hideFromMenu: true,
        },
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "**",
        redirectTo: "dashboard",
        data: {
          hideFromMenu: true,
        },
      },
    ],
  },
];

// export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(routes, {
  // preloadingStrategy: PreloadAllModules,
  // relativeLinkResolution: "legacy",
  enableTracing: false,
});

export class CustomReuseStrategy implements RouteReuseStrategy {
  routesToCache: string[] = [
    "/form",
    "/address",
    "/manage/user",
    "/manage/group",
    "/research",
    "/reports/uvp-upload-check",
  ];

  private handlers: Map<Route, DetachedRouteHandle> = new Map();

  constructor(configService: ConfigService) {
    configService.$userInfo
      .pipe(filter((user) => user !== null))
      .subscribe((user) => {
        const catalogId = user.currentCatalog.id;
        this.routesToCache = this.routesToCache.map(
          (route) => "/" + catalogId + route,
        );
      });
  }

  public shouldDetach(_route: ActivatedRouteSnapshot): boolean {
    return this.routesToCache.some(
      // @ts-ignore
      (definiton) => _route._routerState.url.indexOf(definiton) === 0,
    );
  }

  public store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle,
  ): void {
    if (!route.routeConfig) return;
    this.handlers.set(route.routeConfig, handle);
  }

  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && !!this.handlers.get(route.routeConfig);
  }

  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig || !this.handlers.has(route.routeConfig))
      return null;
    return this.handlers.get(route.routeConfig)!;
  }

  public shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot,
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
