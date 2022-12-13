import { Component } from "@angular/core";
import { FieldArrayType } from "@ngx-formly/core";
import { MatDialog } from "@angular/material/dialog";
import { SelectServiceDialog } from "./select-service-dialog/select-service.dialog";
import { SelectCswRecordDialog } from "./select-csw-record-dialog/select-csw-record-dialog";

@Component({
  selector: "ige-document-reference-type",
  templateUrl: "./document-reference-type.component.html",
  styleUrls: ["./document-reference-type.component.scss"],
})
export class DocumentReferenceTypeComponent extends FieldArrayType {
  constructor(private dialog: MatDialog) {
    super();
  }

  showInternalRefDialog() {
    this.dialog
      .open(SelectServiceDialog)
      .afterClosed()
      .subscribe((uuid) => {
        if (uuid) this.add(null, { uuid: uuid, isExternalRef: false });
      });
  }

  showExternalRefDialog() {
    this.dialog
      .open(SelectCswRecordDialog)
      .afterClosed()
      .subscribe((url) => {
        if (url) this.add(null, { url: url, isExternalRef: true });
      });
  }
}
