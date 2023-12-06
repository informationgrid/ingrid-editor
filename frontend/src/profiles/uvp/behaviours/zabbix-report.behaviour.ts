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
      path: "zabbix-report",
      loadChildren: () =>
        import("../reports/zabbix-report.module").then(
          (m) => m.ZabbixReportModule,
        ),
      data: {
        title: "Monitoring",
        permission: "manage_catalog",
      },
    });
  }

  private removeReportTab() {
    this.reportsService.removeRoute("zabbix-report");
  }
}
