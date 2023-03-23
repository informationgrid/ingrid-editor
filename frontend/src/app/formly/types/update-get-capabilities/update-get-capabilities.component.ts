import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { FieldTypeConfig } from "@ngx-formly/core";
import { GetCapabilitiesDialogComponent } from "./get-capabilities-dialog/get-capabilities-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import {
  GetCapabilitiesAnalysis,
  GetCapabilitiesService,
} from "./get-capabilities-dialog/get-capabilities.service";
import { filter } from "rxjs/operators";

@Component({
  selector: "ige-update-get-capabilities",
  templateUrl: "./update-get-capabilities.component.html",
  styleUrls: ["./update-get-capabilities.component.scss"],
})
export class UpdateGetCapabilitiesComponent extends FieldType<FieldTypeConfig> {
  constructor(
    private dialog: MatDialog,
    private getCapService: GetCapabilitiesService
  ) {
    super();
  }
  showDialog() {
    this.dialog
      .open(GetCapabilitiesDialogComponent, {
        minWidth: 500,
        maxWidth: "80vw",
        disableClose: true,
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((result) => this.updateDataset(result));
  }

  private updateDataset(values: GetCapabilitiesAnalysis) {
    console.log("Dialog result: ", values);
    this.getCapService.applyChangesToModel(this.field.model, values);
    this.field.options.formState.updateModel();
    this.form.markAsDirty();
  }
}
