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
            this.addDatepicker("receiptDate", "Eingang des Antrags", {
              required: true,
              datepickerOptions: {
                max: new Date(),
              },
              validators: { ...this.dateTooBigValidator },
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
          ]),
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
        ],
      },
    ];
}
