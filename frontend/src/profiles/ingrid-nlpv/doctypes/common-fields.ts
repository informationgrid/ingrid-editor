/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
import { FormFieldHelper } from "../../form-field-helper";
import { Injectable } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Injectable({ providedIn: "root" })
export class CommonFieldsNLPV extends FormFieldHelper {
  addImages(fieldConfig: FormlyFieldConfig[]) {
    fieldConfig
      .find((field) => field.props.label === "Organisationsdaten")
      .fieldGroup.push(
        this.addPreviewImage("images", "Bilder", {
          className: "optional",
        }),
      );
  }

  getFeesFieldConfig(): FormlyFieldConfig {
    return this.addTextArea("fees", "Gebühren", "nlpv");
  }
}
