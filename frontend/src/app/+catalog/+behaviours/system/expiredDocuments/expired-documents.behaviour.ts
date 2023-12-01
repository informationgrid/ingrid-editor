import { Plugin } from "../../plugin";
import { ReportsService } from "../../../../+reports/reports.service";
import { TabExpirationComponent } from "../../../../+reports/+tab-expiration/tab-expiration.component";
import { inject, Injectable } from "@angular/core";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable({ providedIn: "root" })
export class ExpiredDocumentsBehaviour extends Plugin {
  id = "plugin.expired.documents";
  name = "Abgelaufene Metadaten";
  description = "Fügt den Tab 'Abgelaufene Metadaten' unter Reports hinzu.";
  defaultActive = true;
  hide = true;
  group = "Reports";

  constructor(private reportsService: ReportsService) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  register(): void {
    super.register();
    this.reportsService.addRoute({
      path: "expiration",
      component: TabExpirationComponent,
      data: {
        title: "Abgelaufene Metadaten",
        tabIdentifier: "expiration",
      },
    });
  }

  unregister(): void {
    super.unregister();
    this.reportsService.removeRoute("expiration");
  }
}
