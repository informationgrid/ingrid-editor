import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseDoctype } from "../base.doctype";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { IgeDocument } from "../../app/models/ige-document";
import { map } from "rxjs/operators";

export class AddressDoctype extends BaseDoctype {
  label = "Person";

  iconClass = "Freie-Adresse";

  isAddressType = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      {
        wrappers: ["section"],
        templateOptions: {
          label: "Allgemeines",
        },
        expressionProperties: {
          "templateOptions.label":
            'model.organization ? "Organisationsdaten" : "Persönliche Daten"',
        },
        fieldGroup: [
          {
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Organisation",
            },
            expressionProperties: {
              "templateOptions.required":
                "(!model.firstName && !model.lastName) || (model.firstName.length === 0 && model.lastName && model.lastName.length === 0) || (model.organization && model.organization.length !== 0)",
            },
            fieldGroup: [
              {
                fieldGroupClassName: "display-flex",
                fieldGroup: [
                  {
                    key: "organization",
                    className: "width-100 organization",
                    type: "input",
                    templateOptions: {
                      label: "Organisation",
                      appearance: "outline",
                    },
                    expressionProperties: {
                      "templateOptions.required":
                        "(!model.firstName && !model.lastName) || (model.firstName.length === 0 && model.lastName && model.lastName.length === 0)",
                    },
                  },
                ],
              },
              {
                fieldGroupClassName: "display-flex",
                fieldGroup: [
                  {
                    key: "department",
                    className: "width-100 organization animated",
                    type: "input",
                    templateOptions: {
                      label: "Abteilung/Referat",
                      appearance: "outline",
                      animation: true,
                    },
                    hideExpression:
                      "!model.organization || model.organization.length === 0",
                  },
                ],
              },
            ],
          },
          {
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Anrede",
              required: false,
            },
            fieldGroup: [
              {
                fieldGroupClassName: "display-flex width-50",
                fieldGroup: [
                  {
                    key: "salutation",
                    className: "flex-1",
                    type: "autocomplete",
                    wrappers: ["form-field"],
                    templateOptions: {
                      highlightMatches: true,
                      hideDeleteButton: true,
                      label: "Anrede",
                      appearance: "outline",
                      options: this.getCodelistForSelect(4300, "salutation"),
                    },
                  },
                  {
                    key: "academic-title",
                    className: "flex-1 pad-right",
                    type: "select",
                    templateOptions: {
                      label: "Titel",
                      appearance: "outline",
                      options: this.getCodelistForSelectWithEmtpyOption(
                        4305,
                        "academic-title"
                      ),
                    },
                  },
                ],
              },
            ],
            hideExpression:
              "(!model.firstName && !model.lastName) || (model.firstName.length === 0 && model.lastName && model.lastName.length === 0)",
          },
          {
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Name",
            },
            expressionProperties: {
              "templateOptions.required":
                "!model.organization || model.organization.length === 0",
            },
            fieldGroup: [
              {
                fieldGroupClassName: "display-flex",
                fieldGroup: [
                  {
                    key: "firstName",
                    className: "flex-1 firstName",
                    type: "input",
                    templateOptions: {
                      label: "Vorname",
                      appearance: "outline",
                    },
                  },
                  {
                    key: "lastName",
                    className: "flex-1 lastName",
                    type: "input",
                    templateOptions: {
                      label: "Nachname",
                      appearance: "outline",
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
                    key: "po-box",
                    className: "flex-1",
                    type: "input",
                    templateOptions: {
                      label: "Postfach",
                      appearance: "outline",
                    },
                  },
                  {
                    key: "zip-po-box",
                    className: "flex-3",
                    type: "input",
                    templateOptions: {
                      label: "Postfach-Nr.",
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
                    key: "administrativeArea",
                    type: "select",
                    className: "flex-1",
                    templateOptions: {
                      label: "Verwaltungsgebiet",
                      appearance: "outline",
                      placeholder: "Bitte wählen",
                      options: this.getCodelistForSelectWithEmtpyOption(
                        110,
                        "administrativeArea"
                      ),
                    },
                  },
                  {
                    key: "country",
                    type: "select",
                    className: "flex-1",
                    templateOptions: {
                      label: "Land",
                      appearance: "outline",
                      placeholder: "Bitte wählen",
                      options: this.getCodelistForSelectWithEmtpyOption(
                        6200,
                        "country"
                      ),
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
