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
import { inject, Injectable } from "@angular/core";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import { PermissionsDialogComponent } from "./permissions-dialog/permissions-dialog.component";
import { ConfigService } from "../../../../services/config/config.service";
import { UserService } from "../../../../services/user/user.service";
import { Router } from "@angular/router";
import { UserWithDocPermission } from "../../../../+user/user";
import { FormMenuService } from "../../../../+form/form-menu.service";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import { TreeQuery } from "../../../../store/tree/tree.query";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { Plugin } from "../../plugin";
import { PluginService } from "../../../../services/plugin/plugin.service";

@Injectable()
export class ShowDocumentPermissionsHandlerPlugin extends Plugin {
  id = "plugin.show.document.permissions.handler";
  name = "Berechtigungen anzeigen";
  description =
    "Administratoren können die Zugriffsberechtigungen für Dokumente und Adressen anzeigen";
  defaultActive = true;
  isPrivileged: boolean;

  constructor(
    private docEvents: DocEventsService,
    private dialog: MatDialog,
    private userService: UserService,
    private docEventsService: DocEventsService,
    private configService: ConfigService,
    private formMenuService: FormMenuService,
    private addressTreeQuery: AddressTreeQuery,
    private documentTreeQuery: TreeQuery,
    private router: Router,
  ) {
    super();

    let role = configService.$userInfo.getValue().role;
    this.isPrivileged =
      role === "ige-super-admin" || role === "cat-admin" || role === "md-admin";

    inject(PluginService).registerPlugin(this);
  }

  unregister() {
    super.unregister();
    this.formMenuService.removeMenuItem("dataset", this.menuItemId);
    this.formMenuService.removeMenuItem("address", this.menuItemId);
  }

  private menuItemId = "show-document-permissions";

  register() {
    super.register();
    if (this.isPrivileged) {
      const onEvent = this.docEvents
        .onEvent("SHOW_DOCUMENT_PERMISSIONS")
        .subscribe((event) => {
          console.log("SHOW_DOCUMENT_PERMISSIONS", event);
          this.showDialog(event.data.id);
        });
      this.subscriptions.push(onEvent);

      const onDocLoad = this.documentTreeQuery.openedDocument$.subscribe(
        (doc) => this.updateShowRightsButton(doc, false),
      );
      const onDocLoadAdress = this.addressTreeQuery.openedDocument$.subscribe(
        (doc) => this.updateShowRightsButton(doc, true),
      );
      this.subscriptions.push(onDocLoad, onDocLoadAdress);
    }
  }

  private updateShowRightsButton(doc: DocumentAbstract, forAddress: boolean) {
    const button = {
      title: "Berechtigungen anzeigen",
      name: this.menuItemId,
      action: () =>
        this.docEventsService.sendEvent({
          type: "SHOW_DOCUMENT_PERMISSIONS",
          data: { id: doc.id },
        }),
    };
    // refresh menu item
    const menuId = forAddress ? "address" : "dataset";
    this.formMenuService.removeMenuItem(menuId, this.menuItemId);
    this.formMenuService.addMenuItem(menuId, button);
  }

  private showDialog(id: number) {
    this.dialog
      .open(PermissionsDialogComponent, {
        width: "780px",
        data: {
          id: id,
          forResponsibility: false,
        },
        delayFocusTrap: true,
      })
      .afterClosed()
      .subscribe((user) => {
        if (user instanceof UserWithDocPermission) {
          this.userService.selectedUser$.set(user);
          this.router.navigate([`${ConfigService.catalogId}/manage/user`]);
        }
      });
  }
}
