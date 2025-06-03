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
import { AuthGuard } from "../security/auth.guard";
import { CatalogSettingsComponent } from "./catalog-settings.component";
import { CatalogCodelistsComponent } from "./codelists/catalog-codelists.component";
import { IndexingComponent } from "./indexing/indexing.component";
import { BehavioursComponent } from "./+behaviours/behaviours.component";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { Route } from "@angular/router";

export default [
  {
    path: "",
    component: CatalogSettingsComponent,
    canActivate: [AuthGuard],
    // canDeactivate: [BehavioursChangedGuard],
    data: { roles: ["admin"] },
    children: <Route[]>[
      {
        path: "",
        redirectTo: "codelists",
        pathMatch: "full",
      },
      {
        path: "codelists",
        component: CatalogCodelistsComponent,
        data: {
          title: "Codelisten",
        },
      },
      {
        path: "form-behaviours",
        component: BehavioursComponent,
        data: {
          title: "Verhalten",
        },
      },
      {
        path: "indexing",
        component: IndexingComponent,
        data: {
          title: "Indizierung",
        },
      },
      {
        path: "config",
        component: ConfigurationComponent,
        data: {
          title: "Konfiguration",
        },
      },
    ],
  },
] satisfies Route[];
