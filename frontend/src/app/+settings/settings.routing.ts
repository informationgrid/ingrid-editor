import { RouterModule } from "@angular/router";
import { SettingsComponent } from "./settings.component";
import { GeneralSettingsComponent } from "./general-settings/general-settings.component";
import { CodelistsComponent } from "./codelists/codelists.component";
import { CatalogManagementComponent } from "./catalog-management/catalog-management.component";
import { AuthGuard } from "../security/auth.guard";
import { IBusManagementComponent } from "./ibus-management/i-bus-management.component";
import { MessagesManagementComponent } from "./messages-management/messages-management.component";
import { CatalogAssignmentComponent } from "./catalog-assignment/catalog-assignment.component";
import { ContentManagementComponent } from "./content-management/content-management.component";

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
        pathMatch: "full",
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
          title: "Katalogverwaltung",
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
          roles: ["admin"],
          permission: "manage_messages",
        },
      },
      {
        path: "catalogAssignment",
        component: CatalogAssignmentComponent,
        data: {
          title: "Katalogzuweisung",
          permission: "manage_all_catalogs",
        },
      },
      {
        path: "contentManagement",
        component: ContentManagementComponent,
        data: {
          title: "Inhalte verwalten",
          permission: "manage_all_catalogs",
        },
      },
    ],
  },
]);
