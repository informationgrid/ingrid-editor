import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
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
    path: "user",
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
];

// export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(routes, {
  preloadingStrategy: PreloadAllModules,
  relativeLinkResolution: "legacy",
});
