import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { BaseDoctype } from "../base.doctype";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { Injectable } from "@angular/core";
import { CodelistStore } from "../../app/store/codelist/codelist.store";
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

  constructor(
    codelistService: CodelistService,
    codelistStore: CodelistStore,
    private uploadService: UploadService,
    private configService: ConfigService,
    codelistQuery: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }

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
      this.addSection("mCLOUD", [
        this.addTextArea("accessRights", "Nutzungshinweise", this.id),
        this.addRepeatChip("mCloudCategories", "mCLOUD Kategorie", {
          required: true,
          useDialog: true,
          options: this.getCodelistForSelect(20000, "mCloudCategories"),
          codelistId: 20000,
        }),
        this.addRepeatChip("DCATThemes", "OpenData Kategorie", {
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
              key: "type",
              type: "select",
              label: "Typ",
              props: {
                label: "Typ",
                appearance: "outline",
                required: true,
                options: this.getCodelistForSelect(20002, null),
                codelistId: 20002,
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
                options: this.getCodelistForSelect(20003, null),
                codelistId: 20003,
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
          options: this.getCodelistForSelect(6500, "license"),
          codelistId: 6500,
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
                options: this.getCodelistForSelect(502, "text").pipe(
                  map((items) => items.filter((it) => it.value !== "2"))
                ),
                codelistId: 502,
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
          options: this.getCodelistForSelectWithEmtpyOption(518, "periodicity"),
          codelistId: 518,
        }),
      ]),
    ];
}
