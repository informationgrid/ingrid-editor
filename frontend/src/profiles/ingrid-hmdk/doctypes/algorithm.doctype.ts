/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { inject, Injectable } from "@angular/core";
import { AlgorithmDoctype } from "../../ingrid/doctypes/algorithm.doctype";
import { SharedHmdk } from "./shared-hmdk";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Injectable({
  providedIn: "root",
})
export class AlgorithmDoctypeHMDK extends AlgorithmDoctype {
  private sharedHmdk = inject(SharedHmdk);

  metadataOptions = () => {
    const options = super.metadataOptions();
    options
      .find((item) => item.label === "Open Data")
      .typeOptions[0].items.push(this.sharedHmdk.metadataOptions(this));
    return options;
  };

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    const fieldConfigHmdk = this.sharedHmdk.manipulateDocumentFields(
      this,
      fieldConfig,
    );

    // at least one link in "Verweise" (or a file in "Dateien") is required when HmbTG
    // is activated. formly does not apply validators to keyless sections, so the
    // validator is attached to the leaf fields of the section instead.
    const urlFields = [
      "apiUrl",
      "sourceCodeUrl",
      "websiteUrl",
      "exampleUrl",
      "publiccodeUrl",
      "additionalUrls",
    ];
    fieldConfigHmdk
      .find((field) => field.props.label === "Verweise")
      ?.fieldGroup?.filter((field) => urlFields.includes(String(field.key)))
      .forEach((field) => {
        field.validators = {
          ...field.validators,
          urlOrFileWhenHmbtg: this.sharedHmdk.urlOrFileWhenHmbtg,
        };
      });

    return fieldConfigHmdk;
  };

  handleActivateOpenData(field: FormlyFieldConfig) {
    return this.sharedHmdk.hmdkHandleActivateOpenData(
      field,
      super.handleActivateOpenData(field),
    );
  }

  handleDeactivateOpenData(field: FormlyFieldConfig) {
    return this.sharedHmdk.hmdkHandleDeactivateOpenData(field);
  }
}
