/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { Injectable } from "@angular/core";
import { UvpShared } from "./uvp-shared";

@Injectable({
  providedIn: "root",
})
export class ForeignProjectsDoctype extends UvpShared {
  id = "UvpForeignProjectDoc";

  label = "Ausländisches Vorhaben";

  iconClass = "auslaendisches-vorhaben";

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addSection("Allgemeines", [
        this.addTextArea(
          "description",
          "Allgemeine Vorhabenbeschreibung",
          this.id,
          {
            required: true,
          },
        ),
        this.addPointOfContact(),
      ]),
      this.addSection("Raumbezug", [
        this.addSpatial("spatial", null, {
          required: true,
          limitTypes: ["free"],
          max: 1,
        }),
      ]),
      {
        key: "processingSteps",
        type: "uvpPhases",
        fieldArray: {
          fieldGroup: [
            this.addPublicDisclosure(),
            this.addDecisionOfAdmission(),
          ],
        },
        validators: {
          consistent: (control, field) => {
            const missingType = field.model?.some((item) => !item.type);
            if (missingType) {
              throw new Error(
                "Datensatz inkonsistent. Bitte laden Sie die IGE-NG Seite erneut.",
              );
            }
            return true;
          },
        },
      },
    ];
}
