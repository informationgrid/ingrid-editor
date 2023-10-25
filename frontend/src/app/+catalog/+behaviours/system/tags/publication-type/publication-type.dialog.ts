import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface PublicationTypeDialogOptions {
  options: { key: string; value: string }[];
  current: string;
}

@Component({
  selector: "ige-publication-type.dialog",
  templateUrl: "./publication-type.dialog.html",
  styleUrls: ["./publication-type.dialog.scss"],
})
export class PublicationTypeDialog {
  options = this.value.options;
  currentValue: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private value: PublicationTypeDialogOptions,
    private dlgRef: MatDialogRef<string>,
  ) {
    this.currentValue =
      value.current
        .split(",")
        .find((item) => this.options.find((option) => option.key === item)) ??
      "internet";
  }

  submit() {
    this.dlgRef.close(this.currentValue);
  }
}
