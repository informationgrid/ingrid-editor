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
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class NegativePreliminaryAssessmentDoctype extends UvpShared {
  id = "UvpNegativePreliminaryAssessmentDoc";

  label = "Negative Vorprüfung";

  iconClass = "negative-vorpruefung";

  forPublish = false;

  documentFields = () =>
    !this.forPublish
      ? <FormlyFieldConfig[]>[
          this.addSection("Allgemeines", [
            this.addPointOfContact(),
            this.addDatepicker("decisionDate", "Datum der Entscheidung", {
              required: true,
              datepickerOptions: {
                max: new Date(),
              },
              validators: { ...this.dateTooBigValidator },
            }),
          ]),
        ]
      : <FormlyFieldConfig[]>[
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
            this.addRepeatList("eiaNumbers", "UVP-Nummern", {
              required: true,
              showSearch: true,
              options: this.getCodelistForSelect(
                this.uvpNumberCodelistId,
                "eiaNumbers",
              ).pipe(map((list) => this.sortUVPNumber(list))),
              codelistId: this.uvpNumberCodelistId,
              asSelect: true,
            }),
            this.addDatepicker("decisionDate", "Datum der Entscheidung", {
              required: true,
              datepickerOptions: {
                max: new Date(),
              },
              validators: { ...this.dateTooBigValidator },
            }),
            this.addTable(
              "uvpNegativeDecisionDocs",
              "Ergebnis der UVP-Vorprüfung",
              {
                required: true,
                columns: this.columnsForDocumentTable,
                batchValidUntil: "validUntil",
              },
            ),
          ]),
        ];
}
