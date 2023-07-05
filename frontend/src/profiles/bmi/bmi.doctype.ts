import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseDoctype } from "../base.doctype";
import { inject, Injectable } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { UploadService } from "../../app/shared/upload/upload.service";
import { ConfigService } from "../../app/services/config/config.service";

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
@Injectable({
  providedIn: "root",
})
export class BmiDoctype extends BaseDoctype {
  id = "BmiDoc";

  label = "Open Data Dokument";

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
          allowedTypes: ["10", "11", "9", "6", "2"],
          validators: {
            needPublisher: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.some((row) => row.type.key === "10")
                  : false,
              message: "Es muss ein Herausgeber als Adresse angegeben sein",
            },
            onePublisher: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.filter((row) => row.type.key === "10").length < 2
                  : true,
              message: "Es darf nur ein Herausgeber angegeben werden",
            },
            publisherPublished: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.every((row) => row.ref._state === "P")
                  : false,
              message: "Alle Adressen müssen veröffentlicht sein",
            },
          },
        }),
        this.addRepeatChip("keywords", "Schlagworte"),
      ]),
      this.addSection("Open Data", [
        this.addTextArea(
          "legalBasis",
          "Rechtsgrundlage für die Zugangseröffnung",
          this.id
        ),
        this.addRepeatChip("DCATThemes", "Open Data Kategorie", {
          required: true,
          useDialog: true,
          options: this.getCodelistForSelect(20001, "DCATThemes"),
          codelistId: 20001,
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
            },
            {
              key: "format",
              type: "select",
              label: "Datenformat",
              wrappers: ["form-field"],
              props: {
                label: "Datenformat",
                appearance: "outline",
                options: this.getCodelistForSelect(20003, null),
                codelistId: 20003,
                formatter: (item: any) =>
                  this.formatCodelistValue("20003", item),
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
        this.addSelect("license", "Lizenz", {
          required: true,
          options: this.getCodelistForSelect(20004, "null"),
          codelistId: 20004,
        }),
        this.addTextArea("origin", "Quellenvermerk", this.id),
      ]),
      this.addSection("Raumbezüge", [this.addSpatial("spatial", "Raumbezüge")]),
      this.addSection("Zeitbezüge", [
        this.addGroup("temporal", "Zeitspanne", [
          this.addSelect("rangeType", null, {
            showSearch: true,
            className: "flex-1",
            wrappers: ["form-field"],
            options: [
              { label: "", value: undefined },
              { label: "am", value: "at" },
              { label: "seit", value: "since" },
              { label: "bis", value: "till" },
              { label: "von - bis", value: "range" },
            ],
          }),
          this.addDatepicker("timeSpanDate", null, {
            placeholder: "TT.MM.JJJJ",
            wrappers: ["form-field"],
            required: true,
            expressions: {
              hide: "model?.rangeType?.key == null || model?.rangeType?.key === 'range'",
            },
          }),
          this.addDateRange("timeSpanRange", null, {
            wrappers: ["form-field"],
            required: true,
            expressions: {
              hide: "model?.rangeType?.key !== 'range'",
            },
          }),
        ]),
        this.addSelect("periodicity", "Periodizität", {
          showSearch: true,
          options: this.getCodelistForSelectWithEmtpyOption(518, "periodicity"),
          codelistId: 518,
        }),
      ]),
    ];
}
