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
