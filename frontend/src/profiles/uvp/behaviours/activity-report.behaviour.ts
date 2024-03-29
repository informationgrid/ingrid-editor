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
import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { Injectable } from "@angular/core";
import { ReportsService } from "../../../app/+reports/reports.service";
import { AuthGuard } from "../../../app/security/auth.guard";

@Injectable({ providedIn: "root" })
export class ActivityReportBehaviour extends Plugin {
  id = "plugin.activity.report";
  name = "Aktivitätsbericht";
  description =
    'Es wird ein Aktivitätsbericht für Katalogadministratoren im "Reports" Bereich angezeigt der alle Aktivitäten von Dokumenten auflistet. (Erstellung, Veröffentlichung, Löschung)';
  defaultActive = false;
  group = "UVP";

  path = "activity-report";

  constructor(private reportsService: ReportsService) {
    super();
  }

  register() {
    this.addReportTab();
    super.register();
  }

  unregister() {
    this.removeReportTab();
    super.unregister();
  }

  private addReportTab() {
    this.reportsService.addRoute({
      canActivate: [AuthGuard],
      path: this.path,
      loadComponent: () =>
        import("../reports/activity-report/activity-report.component").then(
          (m) => m.ActivityReportComponent,
        ),
      data: {
        title: "Aktivitätsbericht",
        permission: "manage_catalog",
      },
    });
  }

  private removeReportTab() {
    this.reportsService.removeRoute(this.path);
  }
}
