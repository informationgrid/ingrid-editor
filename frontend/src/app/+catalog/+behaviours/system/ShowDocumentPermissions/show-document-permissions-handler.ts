import { Plugin } from "../../plugin";
import { Injectable } from "@angular/core";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import { PermissionsDialogComponent } from "./permissions-dialog/permissions-dialog.component";
import { ConfigService } from "../../../../services/config/config.service";
import { UserService } from "../../../../services/user/user.service";
import { Router } from "@angular/router";
import { UserWithDocPermission } from "../../../../+user/user";
import { FormMenuService, MenuId } from "../../../../+form/form-menu.service";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import { TreeQuery } from "../../../../store/tree/tree.query";

@Injectable()
export class ShowDocumentPermissionsHandlerPlugin extends Plugin {
  id = "plugin.show.document.permissions.handler";
  name = "Berechtigungen anzeigen";
  description = "";
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
    this.formMenuService.removeMenuItem(this.menuId, this.menuItemId);
  }

  private menuId: MenuId = "dataset";
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

      this.menuId = this.forAddress ? "address" : "dataset";

      const treeQuery = this.forAddress
        ? this.addressTreeQuery
        : this.documentTreeQuery;

      const onDocLoad = treeQuery.openedDocument$.subscribe((doc) => {
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
        this.formMenuService.removeMenuItem(this.menuId, this.menuItemId);
        this.formMenuService.addMenuItem(this.menuId, button);
      });
      this.subscriptions.push(onDocLoad);
    }
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
