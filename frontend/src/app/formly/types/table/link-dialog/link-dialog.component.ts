import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormDialogData } from "../form-dialog/form-dialog.component";
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";

@Component({
  selector: "ige-link-dialog",
  templateUrl: "./link-dialog.component.html",
  styleUrls: ["./link-dialog.component.scss"],
})
export class LinkDialogComponent implements OnInit, AfterViewInit {
  private URL_REGEXP =
    "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?;&//=]*)";

  form = new FormGroup({});

  options: FormlyFormOptions = {};

  data: FormDialogData = { fields: [], model: {} };

  constructor(
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<LinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private formData: FormDialogData
  ) {}

  ngAfterViewInit(): void {
    // prevent expression has changed error for form validity on submit button
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    // do not modify original data
    this.data = JSON.parse(JSON.stringify(this.formData));
    this.data.fields = this.data.fields.map((field) => {
      return field.type === "upload" ? this.useLinkInput(field) : field;
    });
  }

  submit() {
    const value = this.prepareResult(this.form.value);
    this.dialogRef.close(value);
  }

  private useLinkInput(field: FormlyFieldConfig) {
    field.type = "input";
    field.validators = {
      url: {
        expression: (c) => new RegExp(this.URL_REGEXP).test(c.value),
        message: "Verwenden Sie bitte eine gültige URL",
      },
    };
    return field;
  }

  private prepareResult(value: any) {
    const uploadKey = this.formData.fields.find(
      (field) => field.type === "upload"
    ).key as string;
    const result = {
      ...value,
    };
    result[uploadKey] = {
      asLink: true,
      value: result[uploadKey],
      uri: result[uploadKey],
    };
    return result;
  }
}
