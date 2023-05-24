import { Plugin } from "../../plugin";
import { Injectable } from "@angular/core";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { MatDialog } from "@angular/material/dialog";
import { PermissionsDialogComponent } from "./permissions-dialog/permissions-dialog.component";
import { ConfigService } from "../../../../services/config/config.service";
import { UserService } from "../../../../services/user/user.service";
import { Router } from "@angular/router";
import { UserWithDocPermission } from "../../../../+user/user";

@Injectable()
export class ShowDocumentPermissionsHandlerPlugin extends Plugin {
  id = "plugin.show.document.permissions.handler";
  name = "Berechtigungen anzeigen";
  description = "";
  defaultActive = true;

  constructor(
    private docEvents: DocEventsService,
    private dialog: MatDialog,
    private userService: UserService,
    private router: Router
  ) {
    super();
  }

  register() {
    super.register();

    const onEvent = this.docEvents
      .onEvent("SHOW_DOCUMENT_PERMISSIONS")
      .subscribe((event) => {
        console.log("SHOW_DOCUMENT_PERMISSIONS", event);
        this.showDialog(event.data.id);
      });

    this.subscriptions.push(onEvent);
  }

  private showDialog(id: number) {
    this.dialog
      .open(PermissionsDialogComponent, {
        width: "780px",
        data: {
          id: id,
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
