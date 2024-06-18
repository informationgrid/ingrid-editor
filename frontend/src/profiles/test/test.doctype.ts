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
import { SelectOptionUi } from "../../app/services/codelist/codelist.service";
import { BaseDoctype } from "../base.doctype";
import { inject, Injectable } from "@angular/core";
import { of } from "rxjs";
import { UntypedFormGroup } from "@angular/forms";
import { UploadService } from "../../app/shared/upload/upload.service";
import { ConfigService } from "../../app/services/config/config.service";

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
@Injectable({
  providedIn: "root",
})
export class TestDoctype extends BaseDoctype {
  // must be same as DBClass!?
  id = "TestDoc";

  label = "Test-Document";

  iconClass = "Geodatendienst";

  private uploadService = inject(UploadService);
  private configService = inject(ConfigService);

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addSection("Eingabetypen", [
        this.addInput("text", "Textfeld", {
          wrappers: ["panel", "form-field"],
          required: true,
        }),
        this.addInput("textMaxLength", "Textfeld Max Länge", {
          wrappers: ["panel", "form-field"],
          required: true,
          maxLength: 10,
          expressions: {
            "props.description": '(model.textMaxLength||"").length+" / 10"',
          },
        }),
        this.addInput("optionalText", "Optionales Textfeld", {
          wrappers: ["panel", "form-field"],
          maxLength: 10,
          className: "optional",
          animation: true,
        }),
        this.addTextArea("description", "Textarea", this.id, {
          className: "description",
          required: true,
          autosize: true,
          autosizeMinRows: 3,
          autosizeMaxRows: 8,
        }),

        this.addSelect("select", "Selectbox", {
          required: true,
          placeholder: "Bitte wählen...",
          options: this.getCodelistForSelect("8000", "select"),
          codelistId: "8000",
        }),
        this.addSelect("selectWithEmpty", "Selectbox mit leerer Option", {
          required: true,
          placeholder: "Bitte wählen...",
          options: this.getCodelistForSelectWithEmptyOption(
            "8000",
            "selectWithEmpty",
          ),
          codelistId: "8000",
        }),
        this.addAutocomplete("autocomplete", "Combobox/Autocomplete", {
          required: true,
          options: this.getCodelistForSelect("6500", "autocomplete"),
          placeholder: "Bitte wählen...",
          codelistId: "6500",
        }),
        this.addDatepicker("date", "Date", {
          required: true,
          placeholder: "Bitte wählen...",
        }),
        this.addDateRange("range", "Date-Range", {
          required: true,
          wrappers: ["panel"],
        }),
        this.addCheckbox("checkbox", "Checkbox", {
          wrappers: ["panel", "inline-help"],
          fieldLabel: "Open Data",
        }),
      ]),
      this.addSection("Mehrfacheingaben", [
        this.addAddressCard("addresses", "Addresses", {
          required: true,
        }),
        {
          key: "multiChips",
          type: "repeatChip",
          wrappers: ["panel"],
          props: {
            externalLabel: "Chips (Dialog)",
            required: true,
            useDialog: true,
            options: this.getCodelistForSelect("100", "multiChips"),
            codelistId: "100",
          },
        },
        this.addRepeatList("multiChipsSimple", "Chips (Input)", {
          view: "chip",
          required: true,
          convert: (val) => (val ? { label: val } : null),
          labelField: "label",
        }),
        this.addRepeat("multiInputs", "Multi-Repeat", {
          required: true,
          fields: [
            this.addDatepicker("date", null, {
              fieldLabel: "Datum",
              className: "flex-1",
              required: true,
              wrappers: ["form-field"],
            }),
            this.addInput("text", null, {
              className: "flex-1",
              fieldLabel: "Typ",
              required: true,
            }),
          ],
        }),
        this.addTable("table", "Table", {
          required: true,
          columns: [
            {
              key: "title",
              type: "input",
              label: "Titel",
              props: {
                label: "Titel",
                appearance: "outline",
              },
            },
            {
              key: "link",
              type: "upload",
              label: "Link",
              wrappers: ["form-field"],
              props: {
                label: "Link",
                appearance: "outline",
                required: true,
                onClick: (docUuid, uri, $event) => {
                  this.uploadService.downloadFile(docUuid, uri, $event);
                },
                formatter: (link: any, form: UntypedFormGroup) => {
                  if (link.asLink) {
                    return `
                         <a  href="${link.uri}" target="_blank" class="no-text-transform icon-in-table">
                         <img  width="20"  height="20" src="assets/icons/external_link.svg"  alt="link"> ${link.uri} </a> `;
                  } else {
                    return `<a href="${
                      this.configService.getConfiguration().backendUrl
                    }upload/${form.get("_uuid").value}/${
                      link.uri
                    }" class="no-text-transform icon-in-table">  <img  width="20"  height="20" src="assets/icons/download.svg"  alt="link"> ${
                      link.uri
                    }</a>`;
                  }
                },
              },
              expressions: {
                "props.label": (field) =>
                  field.formControl.value?.asLink
                    ? "URL (Link)"
                    : "Dateiname (Upload)",
              },
            },
            {
              key: "col3",
              type: "input",
              label: "Spalte 3",
              props: {
                label: "Spalte 3",
                appearance: "outline",
              },
            },
            {
              key: "type",
              type: "ige-select",
              wrappers: ["form-field"],
              label: "Typ",
              props: {
                label: "Typ",
                appearance: "outline",
                options: this.getCodelistForSelect("20002", null),
                codelistId: "20002",
                formatter: (item: any) =>
                  this.formatCodelistValue("20002", item),
              },
            },
          ],
          validators: {
            requiredColumns: {
              expression: (ctrl) => ctrl.value?.every((row) => row.link),
              message: "Es müssen alle Pflichtspalten ausgefüllt sein",
            },
          },
        }),

        this.addRepeatList("repeatListSimple", "Mehrfacheingabe (Simple)", {
          required: true,
          labelField: "Mehrfacheingabe (Simple)",
          placeholder: "Bitte etwas eingeben",
        }),
        this.addRepeatList("repeatListCodelist", "Mehrfacheingabe (Codelist)", {
          labelField: "Mehrfacheingabe (Codelist)",
          placeholder: "Raumbezugscode eingeben...",
          options: this.getCodelistForSelect("100", "repeatListCodelist"),
          codelistId: "100",
        }),
        this.addRepeatList("repeatListStatic", "Mehrfacheingabe (Statisch)", {
          labelField: "Mehrfacheingabe (Statisch)",
          placeholder: "Begriff eingeben...",
          defaultValue: [],
          options: of(<SelectOptionUi[]>[
            { label: "Wert 1", value: "1" },
            { label: "Wert 2", value: "2" },
            { label: "Wert 3", value: "3" },
          ]),
        }),
        this.addRepeatList(
          "repeatListStaticSelect",
          "Mehrfacheingabe (Select)",
          {
            labelField: "Mehrfacheingabe (Select)",
            placeholder: "Wert wählen...",
            defaultValue: [],
            options: of(<SelectOptionUi[]>[
              { label: "Wert 1", value: "1" },
              { label: "Wert 2", value: "2" },
              { label: "Wert 3", value: "3" },
            ]),
            asSelect: true,
          },
        ),

        this.addRepeatDetailList("repeatDetailListImage", "Image List", {
          fields: [this.urlRefFields()],
          required: true,
        }),
        this.addRepeatDetailList("repeatDetailListLink", "Link List", {
          fields: [this.urlRefFields()],
          required: true,
        }),
      ]),

      this.addSection("Raumbezüge", [
        this.addSpatial("map", "Raumbezüge", { required: true }),
      ]),
    ];

  protected urlRefFields() {
    return this.addGroupSimple(null, [
      { key: "_type" },
      this.addInputInline("type", "Typ", {
        wrappers: ["inline-help", "form-field"],
      }),
      this.addInputInline("title", "Titel", {
        required: true,
        wrappers: ["inline-help", "form-field"],
        updateOn: "change",
      }),
      this.addGroupSimple(null, [
        this.addTextAreaInline("description", "Beschreibung/Link", {
          wrappers: ["inline-help", "form-field"],
        }),
      ]),
    ]);
  }
}
