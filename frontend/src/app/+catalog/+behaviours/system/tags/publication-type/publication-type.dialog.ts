import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "ige-publication-type.dialog",
  templateUrl: "./publication-type.dialog.html",
  styleUrls: ["./publication-type.dialog.scss"],
})
export class PublicationTypeDialog {
  options = [
    { key: "internet", value: "Internet" },
    { key: "intranet", value: "Intranet" },
    { key: "amtsintern", value: "amtsintern" },
  ];
  currentValue: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) value: string,
    private dlgRef: MatDialogRef<string>
  ) {
    this.currentValue =
      value
        .split(",")
        .find((item) => this.options.find((option) => option.key === item)) ??
      "internet";
  }

  submit() {
    this.dlgRef.close(this.currentValue);
  }
}
