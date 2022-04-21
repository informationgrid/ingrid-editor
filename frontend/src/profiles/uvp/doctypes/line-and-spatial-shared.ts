import { UvpShared } from "./uvp-shared";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { map } from "rxjs/operators";

export class LineAndSpatialShared extends UvpShared {
  documentFields = () =>
    <FormlyFieldConfig[]>[
      {
        validators: {
          receiptDate: this.receiptDateValidator(),
        },
        fieldGroup: [
          this.addSection("Allgemeines", [
            this.addTextArea("description", "Allgemeine Vorhabenbeschreibung", {
              required: true,
            }),
            this.addPointOfContact(),
          ]),
          this.addSection("Raumbezug", [
            this.addSpatial("spatial", null, {
              required: true,
              limitTypes: ["free"],
              max: 1,
            }),
            this.addDatepicker("receiptDate", "Eingang des Antrags", {
              required: true,
              datepickerOptions: {
                max: new Date(),
              },
            }),
            this.addRepeatList("eiaNumbers", "UVP-Nummern", {
              required: true,
              showSearch: true,
              options: this.getCodelistForSelect(9000, "eiaNumbers").pipe(
                map((list) => this.sortUVPNumber(list))
              ),
              codelistId: 9000,
              asSelect: true,
            }),
            {
              key: "processingSteps",
              type: "uvpPhases",
              fieldArray: {
                fieldGroup: [
                  this.addPublicDisclosure(),
                  this.addPublicHearing(),
                  this.addDecisionOfAdmission(),
                ],
              },
            },
          ]),
        ],
      },
    ];
}
