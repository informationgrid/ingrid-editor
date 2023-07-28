import { Injectable } from "@angular/core";
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
import { Plugin2 } from "../../plugin2";

@Injectable()
export class ShowDocumentPermissionsHandlerPlugin extends Plugin2 {
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
    private router: Router
  ) {
    super();

    let role = configService.$userInfo.getValue().role;
    this.isPrivileged = role === "ige-super-admin" || role === "cat-admin";
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
        (doc) => this.updateShowRightsButton(doc, false)
      );
      const onDocLoadAdress = this.addressTreeQuery.openedDocument$.subscribe(
        (doc) => this.updateShowRightsButton(doc, true)
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
      })
      .afterClosed()
      .subscribe((user) => {
        if (user instanceof UserWithDocPermission) {
          this.userService.selectedUser$.next(user);
          this.router.navigate([`${ConfigService.catalogId}/manage/user`]);
        }
      });
  }
}
