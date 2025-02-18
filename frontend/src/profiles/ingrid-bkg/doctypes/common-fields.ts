/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
import { Injectable } from "@angular/core";
import { FormlyFieldConfig, FormlyFieldProps } from "@ngx-formly/core";
import { BaseDoctype } from "../../base.doctype";
import { FormlyFieldInput } from "@ngx-formly/material/input";

@Injectable({
  providedIn: "root",
})
export class CommonFieldsBkg extends BaseDoctype {
  documentFields(): FormlyFieldConfig[] {
    throw new Error("This should not be called but must be implemented.");
  }

  getAccessConstraints(): FormlyFieldConfig {
    return this.addGroupSimple(null, [
      this.addSelect("accessConstraintsBkg", "Zugriffsbeschränkungen", {
        wrappers: ["panel", "form-field"],
        options: this.getCodelistForSelect("10001", "accessConstraintsBkg"),
        codelistId: "10001",
        expressions: {
          "props.hintStart": (field: FormlyFieldInput) => {
            const selectedKey = field.formControl.value?.key;
            const data = this.codelistStore.getCodelistEntryByKey(
              "10001",
              selectedKey,
            )?.data;
            return data
              ? JSON.parse(data)?.[this.generalStore.catalogLanguage()]
              : "";
          },
          "props.required":
            "!formState.mainModel?.properties?.isInspireIdentified",
        },
      }),
      this.addTextArea("accessConstraintsBkgComment", null, "bkg", {
        fieldLabel: "ergänzender Texteintrag",
      }),
    ]);
  }

  getUseConstraints(): FormlyFieldConfig {
    return this.addGroupSimple(null, [
      this.addSelect("useConstraintsBkg", "Nutzungsbedingungen", {
        required: true,
        wrappers: ["panel", "form-field"],
        options: this.getCodelistForSelect("10003", "useConstraintsBkg"),
        codelistId: "10003",
        expressions: {
          "props.hintStart": (field: FormlyFieldInput) => {
            const selectedKey = field.formControl.value?.key;
            const data = this.codelistStore.getCodelistEntryByKey(
              "10003",
              selectedKey,
            )?.data;
            return data
              ? JSON.parse(data)?.[this.generalStore.catalogLanguage()]
              : "";
          },
        },
      }),
      this.addGroupSimple(
        null,
        [
          this.addTextAreaInline(
            "useConstraintsBkgSource",
            "Quellenvermerk",
            "bkg",
          ),
          this.addTextAreaInline(
            "useConstraintsBkgComment",
            "ergänzender Texteintrag",
            "bkg",
          ),
        ],
        { fieldGroupClassName: "flex-row", wrappers: ["panel"] },
      ),
    ]);
  }
}
