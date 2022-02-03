import { Component, Input, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { distinctUntilChanged, map } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { IgeDocument } from "../../../models/ige-document";
import { FormControl, Validators } from "@angular/forms";

interface LinkType {
  value: string;
  uri: string;
  asLink: boolean;
  documentID: String;
}

@UntilDestroy()
@Component({
  selector: "ige-upload-type",
  templateUrl: "./upload-type.component.html",
  styleUrls: ["./upload-type.component.scss"],
})
export class UploadTypeComponent extends FieldType implements OnInit {
  // TODO: refactor and use direct form control to prevent explicit updates
  upload: LinkType;
  @Input() document: IgeDocument;

  private URL_REGEXP =
    "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)";

  private defaultValue: LinkType = {
    asLink: true,
    value: "",
    uri: "",
    documentID: "",
  };

  control: FormControl;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.upload =
      this.mapStringValue(this.formControl.value) || this.defaultValue;

    this.control = new FormControl(
      { value: this.upload.value, disabled: !this.upload.asLink },
      Validators.pattern(this.URL_REGEXP)
    );

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged(),
        map((value) => this.mapStringValue(value))
      )
      .subscribe((value) => (this.upload = value || this.defaultValue));
  }

  private mapStringValue(value: any): LinkType {
    if (value instanceof Object) {
      return value;
    }

    return {
      asLink: true,
      value: value,
      uri: value,
      documentID: this.model.document._id,
    };
  }

  updateValue() {
    this.upload.value = this.control.value;
    this.upload.uri = this.control.value;
    this.formControl.setValue(this.upload);
  }
}
