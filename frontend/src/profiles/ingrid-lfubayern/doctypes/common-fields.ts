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
import { inject, Injectable } from "@angular/core";
import { FormFieldHelper } from "../../form-field-helper";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistService } from "../../../app/services/codelist/codelist.service";

@Injectable({ providedIn: "root" })
export class CommonFieldsLfuBayern extends FormFieldHelper {
  codelistService = inject(CodelistService);

  getGeodataFieldConfig(): FormlyFieldConfig {
    return this.addInput("dataSetURI", "Geodatenlink", {
      wrappers: ["panel", "form-field"],
    });
  }
  getFeesFieldConfig(): FormlyFieldConfig {
    return this.addTextArea("fees", "Gebühren", "lfub");
  }
  getSupplementFieldConfig(): FormlyFieldConfig {
    return this.addInput("supplementalInformation", "Interne Bemerkungen", {
      wrappers: ["panel", "form-field"],
    });
  }
  getUseConstraintsCommentFieldConfig(): FormlyFieldConfig {
    return this.addTextArea(
      "useConstraintsComments",
      "Nutzungsbedingungen (Ergänzung)",
      "lfub",
    );
  }
  getInternalKeywordsFieldConfig(): FormlyFieldConfig {
    return this.addRepeatList("internalKeywords", "Interne Schlüsselwörter", {
      view: "chip",
      options: this.codelistService.observe("20001"),
      codelistId: "20001",
    });
  }
  getGeologicalKeywordsFieldConfig(): FormlyFieldConfig {
    return this.addRepeatList(
      "geologicalKeywords",
      "Geologische Schlüsselliste",
      {
        view: "chip",
        options: this.codelistService.observe("20000"),
        codelistId: "20000",
      },
    );
  }
}
