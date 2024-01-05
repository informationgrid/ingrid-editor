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

@Injectable({ providedIn: "root" })
export class ZabbixReportBehaviour extends Plugin {
  id = "plugin.zabbix.report";
  name = "Monitoring";
  description =
    'Es wird ein Monitoring-Report für Katalogadministratoren im "Reports" Bereich angezeigt der alle Erreichbarkeitsprobleme von Dokumenten auflistet. Die Verbindung zu einem Zabbix-Server wird vorausgesetzt.';
  defaultActive = false;
  group = "UVP";

  path = "uvp-monitoring";

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
      path: this.path,
      loadComponent: () =>
        import("../reports/zabbix-report/zabbix-report.component").then(
          (m) => m.ZabbixReportComponent,
        ),
      data: {
        title: "Monitoring",
        permission: "manage_catalog",
      },
    });
  }

  private removeReportTab() {
    this.reportsService.removeRoute(this.path);
  }
}
