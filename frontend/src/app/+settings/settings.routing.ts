import { RouterModule } from "@angular/router";
import { SettingsComponent } from "./settings.component";
import { GeneralSettingsComponent } from "./general-settings/general-settings.component";
import { CodelistsComponent } from "./codelists/codelists.component";
import { CatalogManagementComponent } from "./catalog-management/catalog-management.component";
import { AuthGuard } from "../security/auth.guard";
import { IBusManagementComponent } from "./ibus-management/i-bus-management.component";
import { MessagesManagementComponent } from "./messages-management/messages-management.component";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: { roles: ["admin"], permission: "manage_catalog" },
    children: [
      {
        path: "",
        redirectTo: "general",
      },
      {
        path: "general",
        component: GeneralSettingsComponent,
        data: {
          title: "Allgemein",
        },
      },
      {
        path: "codelist",
        component: CodelistsComponent,
        data: {
          title: "Codelist Repository",
        },
      },
      {
        path: "catalog",
        component: CatalogManagementComponent,
        data: {
          title: "Katalog-Verwaltung",
        },
      },
      {
        path: "ibus",
        component: IBusManagementComponent,
        data: {
          title: "iBus-Verwaltung",
        },
      },
      {
        path: "messages",
        component: MessagesManagementComponent,
        data: {
          title: "Benachrichtigungen",
        },
      },
    ],
  },
]);
