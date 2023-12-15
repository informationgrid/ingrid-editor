/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { RouterModule } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { OverviewComponent } from "./overview.component";
import { ImportComponent } from "./import/import.component";
import { ExportComponent } from "./export/export.component";

export const routing = RouterModule.forChild([
  {
    path: "",
    component: OverviewComponent,
    children: [
      {
        path: "",
        redirectTo: "import",
        pathMatch: "full",
      },
      {
        path: "import",
        component: ImportComponent,
        canActivate: [AuthGuard],
        data: {
          permission: ["can_import"],
          title: "Import",
        },
      },
      {
        path: "export",
        component: ExportComponent,
        canActivate: [AuthGuard],
        data: {
          permission: ["can_export"],
          title: "Export",
        },
      },
    ],
  },
]);
