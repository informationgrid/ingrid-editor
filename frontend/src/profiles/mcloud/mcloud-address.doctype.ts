import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseDoctype } from "../base.doctype";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { IgeDocument } from "../../app/models/ige-document";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class McloudAddressDoctype extends BaseDoctype {
  id = "McloudAddressDoc";

  label = "Adresse";

  iconClass = "Institution";

  isAddressType = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      {
        wrappers: ["section"],
        templateOptions: {
          label: "Organisationsdaten",
        },
        fieldGroup: [
          {
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Organisation",
              required: true,
            },
            fieldGroup: [
              {
                fieldGroupClassName: "",
                fieldGroup: [
                  {
                    key: "organization",
                    className: "width-100 organization",
                    type: "input",
                    templateOptions: {
                      label: "Organisation",
                      appearance: "outline",
                      required: true,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        wrappers: ["section"],
        templateOptions: {
          label: "Kommunikation",
        },
        fieldGroup: [
          {
            key: "contact",
            type: "repeat",
            wrappers: ["panel"],
            className: "contact",
            templateOptions: {
              externalLabel: "Kontakt",
              required: true,
              minLength: 1,
            },
            fieldArray: {
              fieldGroupClassName: "display-flex",
              fieldGroup: [
                {
                  key: "type",
                  type: "select",
                  className: "flex-1",
                  templateOptions: {
                    label: "Art",
                    appearance: "outline",
                    required: true,
                    options: this.getCodelistForSelect(4430, "type").pipe(
                      map((items) =>
                        items.filter(
                          (item) => item.value !== "5" && item.value !== "6"
                        )
                      )
                    ),
                  },
                },
                {
                  key: "connection",
                  type: "input",
                  className: "flex-3",
                  templateOptions: {
                    label: "Verbindung",
                    appearance: "outline",
                    required: true,
                  },
                  validators: {
                    validation: ["emailInRepeat"],
                  },
                },
              ],
            },
          },
          {
            key: "address",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Adresse",
            },
            fieldGroup: [
              {
                fieldGroupClassName: "display-flex",
                fieldGroup: [
                  {
                    key: "street",
                    className: "width-100",
                    type: "input",
                    templateOptions: {
                      label: "Straße/Hausnummer",
                      appearance: "outline",
                    },
                  },
                ],
              },
              {
                fieldGroupClassName: "display-flex",
                fieldGroup: [
                  {
                    key: "zip-code",
                    className: "flex-1",
                    type: "input",
                    templateOptions: {
                      label: "PLZ",
                      appearance: "outline",
                    },
                  },
                  {
                    key: "city",
                    className: "flex-3",
                    type: "input",
                    templateOptions: {
                      label: "Ort",
                      appearance: "outline",
                    },
                  },
                ],
              },
              {
                fieldGroupClassName: "display-flex",
                fieldGroup: [
                  {
                    key: "zip-po-box",
                    className: "flex-1",
                    type: "input",
                    templateOptions: {
                      label: "PLZ (Postfach)",
                      appearance: "outline",
                    },
                  },
                  {
                    key: "po-box",
                    className: "flex-3",
                    type: "input",
                    templateOptions: {
                      label: "Postfach",
                      appearance: "outline",
                    },
                  },
                ],
              },
            ],
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

  getIconClass(doc: IgeDocument): string {
    return doc.organization?.length > 0 ? "Institution" : "Freie-Adresse";
  }
}
