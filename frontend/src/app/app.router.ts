import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
  RouterModule,
  Routes,
} from "@angular/router";
import { AuthGuard } from "./security/auth.guard";

export const routes: Routes = [
  {
    path: "dashboard",
    loadChildren: () =>
      import("./+dashboard/dashboard.module").then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
    data: {
      title: "Übersicht",
      icon: "Uebersicht",
    },
  },
  {
    path: "form",
    loadChildren: () =>
      import("./+form/ige-form.module").then((m) => m.IgeFormModule),
    canActivate: [AuthGuard],
    data: {
      title: "Daten",
      icon: "Daten",
    },
  },
  {
    path: "address",
    loadChildren: () =>
      import("./+address/address.module").then((m) => m.AddressModule),
    canActivate: [AuthGuard],
    data: {
      title: "Adressen",
      icon: "Adressen",
    },
  },
  {
    path: "research",
    loadChildren: () =>
      import("./+research/research.module").then((m) => m.ResearchModule),
    canActivate: [AuthGuard],
    data: {
      title: "Recherche",
      icon: "Recherche",
    },
  },
  {
    path: "reports",
    loadChildren: () =>
      import("./+reports/reports.module").then((m) => m.ReportsModule),
    data: {
      onlyAdmin: true,
      title: "Reports",
      icon: "Reports",
    },
  },
  {
    path: "manage",
    loadChildren: () => import("./+user/user.module").then((m) => m.UserModule),
    data: {
      title: "Nutzer & Rechte",
      onlyAdmin: true,
      permission: "manage_users",
      icon: "Nutzer",
    },
  },
  // TODO: check canActivateChild: [AuthGuard],
  {
    path: "importExport",
    loadChildren: () =>
      import("./+importExport/import-export.module").then(
        (m) => m.ImportExportModule
      ),
    canActivate: [AuthGuard],
    data: {
      title: "Import / Export",
      onlyAdmin: true,
      permission: ["can_import", "can_export"],
      icon: "Im-Export",
    },
  },
  {
    path: "catalogs",
    loadChildren: () =>
      import("./+catalog/catalog.module").then((m) => m.CatalogModule),
    data: {
      title: "Katalog",
      onlyAdmin: true,
      permission: "manage_catalog",
      icon: "Katalog",
    },
  },
  {
    path: "settings",
    loadChildren: () =>
      import("./+settings/settings.module").then((m) => m.SettingsModule),
    data: {
      title: "Einstellungen",
      onlyAdmin: true,
      icon: "",
      hideFromMenu: true,
    },
  },
  {
    path: "profile",
    loadChildren: () =>
      import("./+profile/profile.module").then((m) => m.ProfileModule),
    data: {
      title: "Profil verwalten",
      icon: "",
      hideFromMenu: true,
    },
  },
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "/dashboard",
    data: {
      hideFromMenu: true,
    },
  },
];

// export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(routes, {
  // preloadingStrategy: PreloadAllModules,
  // relativeLinkResolution: "legacy",
});

export class CustomReuseStrategy implements RouteReuseStrategy {
  routesToCache: string[] = ["form", "address", "manageuser", "managegroup"];
  storedRouteHandles = new Map<string, DetachedRouteHandle>();

  // Decides if the route should be stored
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.routesToCache.indexOf(this.getKey(route)) > -1;
  }

  //Store the information for the route we're destructing
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    // this.storedRouteHandles.set(route.data[key].path, handle);
    this.storedRouteHandles.set(this.getKey(route), handle);
  }

  //Return true if we have a stored route object for the next route
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedRouteHandles.has(this.getKey(route));
  }

  //If we returned true in shouldAttach(), now return the actual route data for restoration
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.storedRouteHandles.get(this.getKey(route));
  }

  //Reuse the route if we're going to and from the same route
  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private getKey(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .map((el: ActivatedRouteSnapshot) =>
        el.routeConfig ? el.routeConfig.path : ""
      )
      .filter((str) => str.length > 0)
      .join("");
  }
}
