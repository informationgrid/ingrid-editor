import { CodelistService } from "../../app/services/codelist/codelist.service";
import { DocumentService } from "../../app/services/document/document.service";
import { BaseDoctype } from "../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";

@Injectable({
  providedIn: "root",
})
export class AdmissionProcedureDoctype extends BaseDoctype {
  id = "UvpAdmissionProcedureDoc";

  label = "Zulassungsverfahren";

  iconClass = "Projekt";

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
        this.addRepeatChip("eiaNumber", "UVP-Nummer", {
          required: true,
        }),
        this.addCheckbox(
          "prelimAssessment",
          "Vorprüfung durchgeführt (ja/nein)",
          {
            required: false,
          }
        ),
      ]),
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }
}
