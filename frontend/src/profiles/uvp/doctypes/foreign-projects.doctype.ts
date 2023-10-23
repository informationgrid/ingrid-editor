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
