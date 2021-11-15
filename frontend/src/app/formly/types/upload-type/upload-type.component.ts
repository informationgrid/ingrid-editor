import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { distinctUntilChanged, map } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FileUploadModel } from "../../../+importExport/upload/fileUploadModel";

interface LinkType {
  value: string;
  asLink: boolean;
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

  selectedUploads: FileUploadModel[];
  private remember = {
    uploadedFile: "",
    externalLink: "",
  };

  private defaultValue: LinkType = {
    asLink: true,
    value: "",
  };

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.upload =
      this.mapStringValue(this.formControl.value) || this.defaultValue;

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged(),
        map((value) => this.mapStringValue(value))
      )
      .subscribe((value) => (this.upload = value || this.defaultValue));
  }

  uploadComplete(response: string) {
    this.upload.value = this.selectedUploads[0].data.name;
    this.formControl.setValue(this.upload);
  }

  toggleLinkType(asLink: boolean) {
    // remember previously set link during toggling
    if (asLink) {
      this.remember.uploadedFile = this.upload.value;
      this.upload = { asLink: asLink, value: this.remember.externalLink };
    } else {
      this.remember.externalLink = this.upload.value;
      this.upload = { asLink: asLink, value: this.remember.uploadedFile };
    }

    this.formControl.setValue(this.upload);
  }

  private mapStringValue(value: any): LinkType {
    if (value instanceof Object) {
      return value;
    }

    return {
      asLink: true,
      value: value,
    };
  }
}
