import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { FieldTypeConfig } from "@ngx-formly/core";
import { GetCapabilitiesDialogComponent } from "../../../../profiles/ingrid/plugins/get-capabilities-dialog/get-capabilities-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "ige-update-get-capabilities",
  templateUrl: "./update-get-capabilities.component.html",
  styleUrls: ["./update-get-capabilities.component.scss"],
})
export class UpdateGetCapabilitiesComponent extends FieldType<FieldTypeConfig> {
  constructor(private dialog: MatDialog) {
    super();
  }
  showDialog() {
    this.dialog.open(GetCapabilitiesDialogComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 500,
      disableClose: false,
      hasBackdrop: true,
    });
  }
}
