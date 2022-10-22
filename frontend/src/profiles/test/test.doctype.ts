import { FormlyFieldConfig } from "@ngx-formly/core";
import { DocumentService } from "../../app/services/document/document.service";
import {
  CodelistService,
  SelectOptionUi,
} from "../../app/services/codelist/codelist.service";
import { BaseDoctype } from "../base.doctype";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { Injectable } from "@angular/core";
import { of } from "rxjs";

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
@Injectable({
  providedIn: "root",
})
export class TestDoctype extends BaseDoctype {
  // must be same as DBClass!?
  id = "TestDoc";

  label = "Test-Document";

  iconClass = "Geodatendienst";

  documentFields = () =>
    <FormlyFieldConfig[]>[
      {
        wrappers: ["section"],
        templateOptions: {
          label: "Eingabetypen",
        },
        fieldGroup: [
          {
            key: "text",
            type: "input",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Textfeld",
              appearance: "outline",
              required: true,
            },
          },
          {
            key: "textMaxLength",
            type: "input",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Textfeld Max Länge",
              appearance: "outline",
              required: true,
              maxLength: 10,
            },
            expressionProperties: {
              "templateOptions.description":
                '(model.textMaxLength||"").length+" / 10"',
            },
          },
          {
            key: "optionalText",
            type: "input",
            className: "optional animated",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Optionales Textfeld",
              appearance: "outline",
              animation: true,
            },
            hideExpression: "formState.hideOptionals",
          },
          {
            key: "description",
            type: "textarea",
            className: "description",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Textarea",
              autosize: true,
              autosizeMinRows: 3,
              autosizeMaxRows: 8,
              appearance: "outline",
              required: true,
            },
          },
          {
            key: "select",
            type: "select",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Selectbox",
              placeholder: "Bitte wählen",
              appearance: "outline",
              options: this.getCodelistForSelect(8000, "select"),
              required: true,
            },
          },
          {
            key: "selectWithEmpty",
            type: "select",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Selectbox mit leerer Option",
              placeholder: "Bitte wählen",
              appearance: "outline",
              options: this.getCodelistForSelectWithEmtpyOption(
                8000,
                "selectWithEmpty"
              ),
              required: true,
            },
          },
          {
            key: "autocomplete",
            type: "autocomplete",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Combobox/Autocomplete",
              placeholder: "Bitte wählen",
              appearance: "outline",
              required: true,
              options: this.getCodelistForSelect(6500, "autocomplete"),
            },
          },
          {
            key: "date",
            type: "datepicker",
            className: "flex-1",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Date",
              placeholder: "Bitte wählen",
              appearance: "outline",
              required: true,
            },
          },
          {
            key: "range",
            type: "date-range",
            wrappers: ["panel", "form-field"],
            templateOptions: {
              externalLabel: "Date-Range",
              placeholder: "Bitte wählen",
              appearance: "outline",
              required: true,
            },
          },
          {
            key: "checkbox",
            type: "checkbox",
            wrappers: ["panel", "form-field", "inline-help"],
            templateOptions: {
              externalLabel: "Checkbox",
              label: "Open Data",
              indeterminate: false,
              required: true,
            },
          },
        ],
      },
      {
        wrappers: ["section"],
        templateOptions: {
          label: "Mehrfacheingaben",
        },
        fieldGroup: [
          {
            key: "addresses",
            type: "address-card",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Addresses",
              required: true,
            },
          },
          {
            key: "multiChips",
            type: "repeatChip",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Chips (Dialog)",
              required: true,
              useDialog: true,
              options: this.getCodelistForSelect(100, "multiChips"),
              codelistId: 100,
            },
          },
          {
            key: "multiChipsSimple",
            type: "repeatChip",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Chips (Input)",
              required: true,
            },
          },
          {
            key: "multiInputs",
            type: "repeat",
            wrappers: ["panel"],
            defaultValue: [{}],
            templateOptions: {
              externalLabel: "Multi-Repeat",
              required: true,
              minLength: 1,
            },
            fieldArray: {
              fieldGroupClassName: "display-flex",
              fieldGroup: [
                {
                  key: "date",
                  type: "datepicker",
                  className: "flex-1",
                  templateOptions: {
                    label: "Datum",
                    appearance: "outline",
                    required: true,
                  },
                },
                {
                  key: "text",
                  type: "input",
                  className: "flex-1",
                  templateOptions: {
                    label: "Typ",
                    appearance: "outline",
                    required: true,
                  },
                },
              ],
            },
          },
          {
            key: "table",
            type: "table",
            templateOptions: {
              externalLabel: "Table",
              supportUpload: true,
              required: true,
              columns: [
                {
                  key: "col1",
                  type: "input",
                  label: "Spalte 1",
                  templateOptions: {
                    label: "Spalte 1",
                    appearance: "outline",
                  },
                },
                {
                  key: "col2",
                  type: "input",
                  label: "Spalte 2",
                  templateOptions: {
                    label: "Spalte 2",
                    appearance: "outline",
                  },
                },
                {
                  key: "col3",
                  type: "input",
                  label: "Spalte 3",
                  templateOptions: {
                    label: "Spalte 3",
                    appearance: "outline",
                  },
                },
              ],
            },
          },
          {
            key: "repeatListSimple",
            type: "repeatList",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Mehrfacheingabe (Simple)",
              placeholder: "Bitte etwas eingeben",
              required: true,
            },
          },
          {
            key: "repeatListCodelist",
            type: "repeatList",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Mehrfacheingabe (Codelist)",
              placeholder: "Raumbezugscode eingeben...",
              options: this.getCodelistForSelect(100, "repeatListCodelist"),
              codelistId: 100,
            },
          },
          {
            key: "repeatListStatic",
            type: "repeatList",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Mehrfacheingabe (Statisch)",
              placeholder: "Begriff eingeben...",
              options: of(<SelectOptionUi[]>[
                { label: "Wert 1", value: "1" },
                { label: "Wert 2", value: "2" },
                { label: "Wert 3", value: "3" },
              ]),
            },
          },
          {
            key: "repeatListStaticSelect",
            type: "repeatList",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Mehrfacheingabe (Select)",
              placeholder: "Wert wählen...",
              options: of(<SelectOptionUi[]>[
                { label: "Wert 1", value: "1" },
                { label: "Wert 2", value: "2" },
                { label: "Wert 3", value: "3" },
              ]),
              asSelect: true,
            },
          },
          {
            key: "repeatDetailListImage",
            type: "repeatDetailList",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Image List",
              asImage: true,
              required: true,
            },
            fieldArray: {
              fieldGroup: [
                {
                  key: "type",
                  type: "input",
                  templateOptions: {
                    label: "Typ",
                    appearance: "outline",
                  },
                },
                {
                  key: "title",
                  type: "input",
                  templateOptions: {
                    label: "Titel",
                    appearance: "outline",
                    required: true,
                  },
                },
                {
                  key: "description",
                  type: "textarea",
                  templateOptions: {
                    label: "Beschreibung/Link",
                    appearance: "outline",
                    autosize: true,
                    autosizeMinRows: 3,
                    autosizeMaxRows: 5,
                  },
                },
              ],
            },
          },
          {
            key: "repeatDetailListLink",
            type: "repeatDetailList",
            wrappers: ["panel"],
            templateOptions: {
              externalLabel: "Link List",
              required: true,
            },
            fieldArray: {
              fieldGroup: [
                {
                  key: "type",
                  type: "input",
                  templateOptions: {
                    label: "Typ",
                    appearance: "outline",
                  },
                },
                {
                  key: "title",
                  type: "input",
                  templateOptions: {
                    label: "Titel",
                    appearance: "outline",
                    required: true,
                  },
                },
                {
                  key: "description",
                  type: "textarea",
                  templateOptions: {
                    label: "Beschreibung/Link",
                    appearance: "outline",
                    autosize: true,
                    autosizeMinRows: 3,
                    autosizeMaxRows: 5,
                  },
                },
              ],
            },
          },
        ],
      },
      {
        wrappers: ["section"],
        templateOptions: {
          label: "Raumbezüge",
        },
        fieldGroup: [
          {
            key: "map",
            type: "leaflet",
            wrappers: [],
            templateOptions: {
              mapOptions: {},
              height: 386,
              required: true,
            },
          },
        ],
      },
    ];

  constructor(
    storageService?: DocumentService,
    codelistService?: CodelistService,
    codelistQuery?: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }
}
