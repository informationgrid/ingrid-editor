import { AfterViewInit, Component, Inject, OnInit } from "@angular/core";
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface FormDialogData {
  fields: FormlyFieldConfig[];
  model: any;
  newEntry?: boolean;
  document?: any;
}

@Component({
  selector: "ige-form-dialog",
  templateUrl: "./form-dialog.component.html",
  styleUrls: ["./form-dialog.component.scss"],
})
export class FormDialogComponent implements OnInit, AfterViewInit {
  model: any;
  document?: any;
  form = new FormGroup({});
  titleText: String;
  options: FormlyFormOptions = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: FormDialogData) {
    this.titleText = data?.newEntry
      ? "Eintrag hinzufügen"
      : "Eintrag bearbeiten";
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.options.resetModel();
  }
}
