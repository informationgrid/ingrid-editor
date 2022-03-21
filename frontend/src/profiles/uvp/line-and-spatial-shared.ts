import { UvpShared } from "./uvp-shared";
import { FormlyFieldConfig } from "@ngx-formly/core";

export class LineAndSpatialShared extends UvpShared {
  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addSection("Allgemeines", [
        this.addTextArea("description", "Allgemeine Vorhabenbeschreibung", {
          required: true,
        }),
        this.addAddressCard(
          "publisher",
          "Kontaktdaten der verfahrensführenden Behörde",
          {
            required: true,
          }
        ),
      ]),
      this.addSection("Raumbezug", [
        this.addSpatial("spatial", null, {
          required: true,
        }),
        this.addDatepicker("receiptDate", "Eingang des Antrags", {
          required: true,
        }),
        this.addRepeatList("eiaNumber", "UVP-Nummer", {
          required: true,
          showSearch: true,
          options: this.getCodelistForSelect(9000, "eiaNumber"),
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
    ];
}
