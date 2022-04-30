import { Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { filter } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ReplaceAddressDialogComponent } from "./replace-address-dialog/replace-address-dialog.component";
import { ConfigService } from "../../../../services/config/config.service";

@Injectable()
export class DeleteReferenceHandlerPlugin extends Plugin {
  id = "plugin.delete.reference.handler";
  name = "Referenzierte Adressen ersetzen";
  description = "";
  group = "Adressen";
  defaultActive = true;
  forAddress = true;
  private disabled = false;

  constructor(
    private docEvents: DocEventsService,
    private dialog: MatDialog,
    configService: ConfigService
  ) {
    super();

    let role = configService.$userInfo.getValue().role;
    const isPrivileged = role === "ige-super-admin" || role === "cat-admin";
    if (!isPrivileged) this.disabled = true;
  }

  register() {
    if (this.disabled) {
      console.debug(
        "DeleteReferenceHandlerPlugin not registered because it's only available for catalog administrators and above."
      );
      return;
    }
    super.register();

    const subscription = this.docEvents
      .onError(this.forAddress)
      .pipe(filter((error) => error.errorCode === "IS_REFERENCED_ERROR"))
      .subscribe((error) => {
        error.response.handled = true;

        this.showDialog();
      });

    this.subscriptions.push(subscription);
  }

  private showDialog() {
    this.dialog
      .open(ReplaceAddressDialogComponent, {
        data: {},
      })
      .afterClosed()
      .subscribe((data) => console.log(data));
  }
}
