/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormFieldHelper } from "../../form-field-helper";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CommonFieldsBast extends FormFieldHelper {
  getFields(): FormlyFieldConfig[] {
    return [
      this.getProjectNumberFieldConfig(),
      this.getProjectTitleFieldConfig(),
      this.getCommentsFieldConfig(),
    ];
  }

  getUseConstraintsCommentsFieldConfig(): FormlyFieldConfig {
    return this.addTextArea(
      "useConstraintsComments",
      "Nutzungshinweise",
      "ingrid",
    );
  }

  private getProjectNumberFieldConfig(): FormlyFieldConfig {
    return this.addInput("projectNumber", "Projektnummer", {
      wrappers: ["panel", "form-field"],
    });
  }

  private getProjectTitleFieldConfig(): FormlyFieldConfig {
    return this.addInput("projectTitle", "Projekttitel", {
      wrappers: ["panel", "form-field"],
    });
  }

  private getCommentsFieldConfig(): FormlyFieldConfig {
    return this.addTextArea("supplementalInformation", "Bemerkungen", {
      wrappers: ["panel", "form-field"],
    });
  }
}
