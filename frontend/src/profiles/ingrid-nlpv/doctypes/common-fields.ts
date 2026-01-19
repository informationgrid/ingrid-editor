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
import { inject, Injectable } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormControl } from "@angular/forms";
import { CodelistService } from "../../../app/services/codelist/codelist.service";

@Injectable({ providedIn: "root" })
export class CommonFieldsNLPV extends FormFieldHelper {
  codelistService = inject(CodelistService);

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

  getMetadataMaintenanceGroupConfig(): FormlyFieldConfig {
    return this.addGroupSimple("metadata", [
      this.addGroupSimple(
        "maintenanceInformation",
        [
          this.addSelect(
            "maintenanceAndUpdateFrequency",
            "Aktualisierungsintervall der Metadaten",
            {
              showSearch: true,
              options: this.codelistService.observe("518"),
              codelistId: "518",
              hintStart: "Wie oft werden die Metadaten aktualisiert?",
              className: "optional",
              change: (field: FormlyFieldConfig) => {
                const isNotContinuously =
                  field.form.value.maintenanceAndUpdateFrequency?.key !== "1";
                if (isNotContinuously) {
                  field.form
                    .get("userDefinedMaintenanceFrequency")
                    .setValue({ number: null, unit: null });
                }
              },
              contextHelpId: "metadataMaintenanceAndUpdateFrequency",
            },
          ),

          this.addUnitInput(
            "userDefinedMaintenanceFrequency",
            "Benutzerdefiniertes Intervall der Metadatenaktualisierung",
            {
              type: "number",
              placeholder: "Bitte eingeben ...",
              unitOptions: this.codelistService.observe("1230"),
              codelistId: "1230",
              fieldGroup: [{ key: "number" }, { key: "unit" }],
              hintStart:
                "Wenn ein Intervall angegeben werden kann, geben Sie das Intervall an, in dem die Metadaten aktualisiert werden.",
              expressions: {
                className: (field: FormlyFieldConfig) => {
                  const notEmpty = !isNaN(
                    parseInt(
                      field.form.value?.userDefinedMaintenanceFrequency?.number,
                    ),
                  );
                  const isNotContinuously =
                    field.options.formState.mainModel?.metadata
                      ?.maintenanceInformation?.maintenanceAndUpdateFrequency
                      ?.key !== "1";
                  if (!notEmpty && isNotContinuously) return "hide";
                  return notEmpty ? "right-align" : "right-align optional";
                },
              },
              validators: {
                min: {
                  expression: (ctrl: FormControl) =>
                    ctrl.value.number === undefined || ctrl.value.number >= 0,
                  message: "Der Wert darf nicht negativ sein",
                },
                continuously: {
                  expression: (ctrl: FormControl) => {
                    const frequency = ctrl.root.get(
                      "metadata.maintenanceInformation.maintenanceAndUpdateFrequency",
                    ).value?.key;
                    return !ctrl.value?.number || frequency === "1";
                  },
                  message:
                    "Werte im Feld 'Benutzerdefiniertes Intervall der Metadatenaktualisierung' dürfen nur angegeben werden, wenn das Feld 'Aktualisierungsintervall der Metadaten' auf den Wert 'kontinuierlich' eingestellt wurde.",
                },
              },
              contextHelpId: "metadataUserDefinedMaintenanceFrequency",
            },
          ),
          this.addTextArea("description", "Erläuterungen", "dataset", {
            className: "optional flex-1",
            contextHelpId: "metadataMaintenanceNote",
          }),
        ].filter(Boolean),
      ),
    ]);
  }
}
