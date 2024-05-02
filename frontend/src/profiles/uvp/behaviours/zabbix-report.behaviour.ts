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
import { DocEventsService } from "../../../app/services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "../../../app/services/config/config.service";
import { FormMenuService } from "../../../app/+form/form-menu.service";
import { TreeQuery } from "../../../app/store/tree/tree.query";
import { DocumentAbstract } from "../../../app/store/document/document.model";
import { ZabbixReportDialogComponent } from "../reports/zabbix-report-dialog/zabbix-report-dialog.component";

@Injectable({ providedIn: "root" })
export class ZabbixReportBehaviour extends Plugin {
  id = "plugin.zabbix.report";
  name = "Monitoring";
  description =
    'Es wird ein Monitoring-Report für Katalogadministratoren im "Reports" Bereich angezeigt der alle Erreichbarkeitsprobleme von Dokumenten auflistet. Die Verbindung zu einem Zabbix-Server wird vorausgesetzt.';
  defaultActive = false;
  group = "UVP";

  path = "uvp-monitoring";
  isPrivileged: boolean;
  private menuItemId = "show-zabbix-report";
  private eventName = "SHOW_ZABBIX_REPORT";

  constructor(
    private reportsService: ReportsService,
    private docEvents: DocEventsService,
    private dialog: MatDialog,
    private docEventsService: DocEventsService,
    configService: ConfigService,
    private formMenuService: FormMenuService,
    private documentTreeQuery: TreeQuery,
  ) {
    super();

    let role = configService.$userInfo.getValue().role;
    this.isPrivileged =
      role === "ige-super-admin" || role === "cat-admin" || role === "md-admin";
  }

  register() {
    this.addReportTab();

    if (this.isPrivileged) {
      const onEvent = this.docEvents
        .onEvent(this.eventName)
        .subscribe((event) => {
          this.showDialog(event.data.id);
        });
      this.subscriptions.push(onEvent);

      const onDocLoad = this.documentTreeQuery.openedDocument$.subscribe(
        (doc) => this.updateZabbixReportButton(doc),
      );

      this.subscriptions.push(onDocLoad);
    }
    super.register();
  }

  unregister() {
    this.formMenuService.removeMenuItem("dataset", this.menuItemId);
    this.removeReportTab();
    super.unregister();
  }

  private updateZabbixReportButton(doc: DocumentAbstract) {
    const button = {
      title: "Monitoring",
      name: this.menuItemId,
      action: () =>
        this.docEventsService.sendEvent({
          type: this.eventName,
          data: { id: doc.id },
        }),
    };
    // refresh menu item
    this.formMenuService.removeMenuItem("dataset", this.menuItemId);
    this.formMenuService.addMenuItem("dataset", button);
  }

  private addReportTab() {
    this.reportsService.addRoute({
      canActivate: [AuthGuard],
      path: this.path,
      loadComponent: () =>
        import("../reports/zabbix-report/zabbix-report.component").then(
          (m) => m.ZabbixReportComponent,
        ),
      data: {
        title: "Monitoring",
        permission: "manage_users",
      },
    });
  }

  private showDialog(id: number) {
    this.dialog
      .open(ZabbixReportDialogComponent, {
        width: "780px",
        data: {
          id: id,
        },
        delayFocusTrap: true,
      })
      .afterClosed()
      .subscribe();
  }

  private removeReportTab() {
    this.reportsService.removeRoute(this.path);
  }
}
