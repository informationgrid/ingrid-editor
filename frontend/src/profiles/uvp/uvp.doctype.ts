import { CodelistService } from "../../app/services/codelist/codelist.service";
import { DocumentService } from "../../app/services/document/document.service";
import { BaseDoctype } from "../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";

@Injectable({
  providedIn: "root",
})
export class UvpDoctype extends BaseDoctype {
  id = "UvpDoc";

  label = "UVP-Verfahren";

  iconClass = "Projekt";

  documentFields = () =>
    <FormlyFieldConfig[]>[
      {
        wrappers: ["section"],
        templateOptions: {
          label: "Allgemeines",
        },
        fieldGroup: [
          {
            key: "description",
            type: "textarea",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Beschreibung",
              autosize: true,
              autosizeMinRows: 3,
              autosizeMaxRows: 8,
              appearance: "outline",
              required: true,
            },
          },
        ],
      },
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }
}
