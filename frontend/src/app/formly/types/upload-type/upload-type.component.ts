import { Component, Input, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { distinctUntilChanged, map } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { IgeDocument } from "../../../models/ige-document";
import { UntypedFormControl, Validators } from "@angular/forms";
import { FieldTypeConfig } from "@ngx-formly/core";
import { patternWithMessage, REGEX_URL } from "../../input.validators";

interface LinkType {
  uri: string;
  asLink: boolean;
  documentID: string;
}

@UntilDestroy()
@Component({
  selector: "ige-upload-type",
  templateUrl: "./upload-type.component.html",
  styleUrls: ["./upload-type.component.scss"],
})
export class UploadTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  // TODO: refactor and use direct form control to prevent explicit updates
  upload: LinkType;
  @Input() document: IgeDocument;

  private defaultValue: LinkType = {
    asLink: true,
    uri: "",
    documentID: "",
  };

  control: UntypedFormControl;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.upload =
      this.mapStringValue(this.formControl.value) || this.defaultValue;

    this.setControl();

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged(),
        map((value) => this.mapStringValue(value)),
      )
      .subscribe((value) => (this.upload = value || this.defaultValue));
  }

  private setControl() {
    const validators = [patternWithMessage(REGEX_URL, "url")];
    if (this.props.required) {
      validators.push(Validators.required);
    }

    this.control = new UntypedFormControl(
      { value: this.upload.uri, disabled: !this.upload.asLink },
      validators,
    );
  }

  private mapStringValue(value: any): LinkType {
    if (value instanceof Object) {
      return value;
    }

    return {
      asLink: true,
      uri: value,
      documentID: this.model.document._uuid,
    };
  }

  updateValue() {
    this.upload.uri = this.control.value;
    this.formControl.setValue(this.upload);
    this.formControl.setErrors(
      this.control.invalid ? this.control.errors : null,
    );
  }
}
