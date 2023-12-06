import { RouterModule, Routes } from "@angular/router";
import { SettingsComponent } from "./settings.component";
import { GeneralSettingsComponent } from "./general-settings/general-settings.component";
import { CodelistsComponent } from "./codelists/codelists.component";
import { CatalogManagementComponent } from "./catalog-management/catalog-management.component";
import { AuthGuard } from "../security/auth.guard";
import { IBusManagementComponent } from "./ibus-management/i-bus-management.component";
import { MessagesManagementComponent } from "./messages-management/messages-management.component";
import { CatalogAssignmentComponent } from "./catalog-assignment/catalog-assignment.component";
import { ContentManagementComponent } from "./content-management/content-management.component";

export const settingsRoutes: Routes = [
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
        canActivate: [AuthGuard],
        data: {
          title: "Codelist Repository",
          permission: "manage_codelist_repository",
        },
      },
      {
        path: "catalog",
        component: CatalogManagementComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Katalogverwaltung",
          permission: "manage_all_catalogs",
        },
      },
      {
        path: "ibus",
        component: IBusManagementComponent,
        canActivate: [AuthGuard],
        data: {
          title: "iBus-Verwaltung",
          permission: "manage_ibus",
        },
      },
      {
        path: "messages",
        component: MessagesManagementComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Benachrichtigungen",
          roles: ["admin"],
          permission: "manage_messages",
        },
      },
      {
        path: "catalogAssignment",
        component: CatalogAssignmentComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Katalogzuweisung",
          permission: "manage_all_catalogs",
        },
      },
      {
        path: "contentManagement",
        component: ContentManagementComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Inhalte",
          permission: "manage_content",
        },
      },
    ],
  },
];
export const routing = RouterModule.forChild(settingsRoutes);
