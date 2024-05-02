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
import { RouterModule, Routes } from "@angular/router";
import { SettingsComponent } from "./settings.component";
import { GeneralSettingsComponent } from "./general-settings/general-settings.component";
import { CodelistsComponent } from "./codelists/codelists.component";
import { CatalogManagementComponent } from "./catalog-management/catalog-management.component";
import { AuthGuard } from "../security/auth.guard";
import { MessagesManagementComponent } from "./messages-management/messages-management.component";
import { CatalogAssignmentComponent } from "./catalog-assignment/catalog-assignment.component";
import { ContentManagementComponent } from "./content-management/content-management.component";
import { ConnectionManagementComponent } from "./connection-management/connection-management.component";

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
        path: "connections",
        component: ConnectionManagementComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Verbindungen",
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
