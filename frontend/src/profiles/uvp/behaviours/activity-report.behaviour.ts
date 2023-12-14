import { Plugin } from "../../../app/+catalog/+behaviours/plugin";
import { Injectable } from "@angular/core";
import { ReportsService } from "../../../app/+reports/reports.service";

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
