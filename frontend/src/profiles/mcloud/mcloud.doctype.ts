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
import { BaseDoctype } from "../base.doctype";
import { inject, Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { UntypedFormGroup } from "@angular/forms";
import { UploadService } from "../../app/shared/upload/upload.service";
import { ConfigService } from "../../app/services/config/config.service";

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
@Injectable({
  providedIn: "root",
})
export class McloudDoctype extends BaseDoctype {
  id = "mCloudDoc";

  label = "mCLOUD";

  iconClass = "Fachaufgabe";

  private uploadService = inject(UploadService);
  private configService = inject(ConfigService);

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addSection("Allgemeines", [
        this.addTextArea("description", "Beschreibung", this.id, {
          required: true,
        }),
        this.addAddressCard("addresses", "Adressen", {
          required: true,
          allowedTypes: ["10"],
          validators: {
            needPublisher: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.some((row) => row.type.key === "10")
                  : false,
              message: "Es muss ein Herausgeber als Adresse angegeben sein",
            },
          },
        }),
        this.addRepeatChip("keywords", "Schlagworte"),
      ]),
      this.addSection("mCLOUD", [
        this.addTextArea("accessRights", "Nutzungshinweise", this.id),
        this.addRepeatChip("mCloudCategories", "mCLOUD Kategorie", {
          required: true,
          useDialog: true,
          options: this.getCodelistForSelect("20000", "mCloudCategories"),
          codelistId: "20000",
        }),
        this.addRepeatChip("DCATThemes", "OpenData Kategorie", {
          required: true,
          useDialog: true,
          options: this.getCodelistForSelect("20001", "DCATThemes"),
          codelistId: "20001",
        }),
        this.addTable("distributions", "Downloads", {
          required: true,
          columns: [
            {
              key: "title",
              id: "title",
              type: "input",
              label: "Titel",
              focus: true,
              class: "flex-2",
              props: {
                label: "Titel",
                appearance: "outline",
              },
            },
            {
              key: "link",
              type: "upload",
              label: "Link",
              class: "flex-2",
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
                    }upload/${this.formStateService.metadata().uuid}/${
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
              key: "type",
              type: "ige-select",
              wrappers: ["form-field"],
              label: "Typ",
              props: {
                label: "Typ",
                appearance: "outline",
                required: true,
                options: this.getCodelistForSelect("20002", null),
                codelistId: "20002",
                formatter: (item: any) =>
                  this.formatCodelistValue("20002", item),
              },
            },
            {
              key: "format",
              type: "autocomplete",
              label: "Datenformat",
              wrappers: ["form-field"],

              props: {
                label: "Datenformat",
                appearance: "outline",
                options: this.getCodelistForSelect("20003", null),
                codelistId: "20003",
                formatter: (item: any) =>
                  this.formatCodelistValue("20003", item),
              },
            },
          ],
          validators: {
            requiredColumns: {
              expression: (ctrl) =>
                ctrl.value?.every((row) => row.link && row.type),
              message: "Es müssen alle Pflichtspalten ausgefüllt sein",
            },
          },
        }),
        this.addAutocomplete("license", "Lizenz", {
          required: true,
          options: this.getCodelistForSelect("6500", "license"),
          codelistId: "6500",
        }),
        this.addTextArea("origin", "Quellenvermerk", this.id),
        this.addGroup(null, "mFUND", [
          this.addInput("mfundProject", null, {
            fieldLabel: "mFUND Projekt",
            id: "mfundProject", // used for autocomplete by browser
            hasInlineContextHelp: true,
            wrappers: ["inline-help", "form-field"],
          }),
          this.addInput("mfundFKZ", null, {
            fieldLabel: "mFUND Förderkennzeichen",
            id: "mfundFKZ", // used for autocomplete by browser
            hasInlineContextHelp: true,
            wrappers: ["inline-help", "form-field"],
          }),
        ]),
      ]),
      this.addSection("Raumbezüge", [this.addSpatial("spatial", "Raumbezüge")]),
      this.addSection("Zeitbezüge", [
        {
          key: "events",
          type: "repeat",
          wrappers: ["panel"],
          props: {
            externalLabel: "Zeitbezug der Ressource",
          },
          fieldArray: {
            fieldGroupClassName: "flex-row",
            fieldGroup: [
              this.addDatepicker("date", null, {
                fieldLabel: "Datum",
                required: true,
                wrappers: ["form-field"],
              }),
              this.addSelect("text", "Typ", {
                showSearch: true,
                required: true,
                className: "flex-1",
                wrappers: ["form-field"],
                externalLabel: null,
                options: this.getCodelistForSelect("502", "text").pipe(
                  map((items) => items.filter((it) => it.value !== "2")),
                ),
                codelistId: "502",
              }),
            ],
          },
        },
        this.addGroup("temporal", "Zeitspanne", [
          this.addSelect("rangeType", null, {
            showSearch: true,
            className: "flex-1",
            wrappers: ["form-field"],
            options: [
              { label: "am", value: "at" },
              { label: "seit", value: "since" },
              { label: "bis", value: "till" },
              { label: "von - bis", value: "range" },
            ],
          }),
          this.addDatepicker("timeSpanDate", null, {
            placeholder: "TT.MM.JJJJ",
            wrappers: ["form-field"],
            expressions: {
              hide: "model?.rangeType?.key === 'range'",
            },
          }),
          this.addDateRange("timeSpanRange", null, {
            expressions: {
              hide: "model?.rangeType?.key !== 'range'",
            },
          }),
        ]),
        this.addSelect("periodicity", "Periodizität", {
          showSearch: true,
          options: this.getCodelistForSelectWithEmptyOption(
            "518",
            "periodicity",
          ),
          codelistId: "518",
        }),
      ]),
    ];
}
