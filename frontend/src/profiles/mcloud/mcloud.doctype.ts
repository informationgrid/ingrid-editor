import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { BaseDoctype } from "../base.doctype";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { Injectable } from "@angular/core";
import { CodelistStore } from "../../app/store/codelist/codelist.store";
import { map } from "rxjs/operators";
import { FormGroup } from "@angular/forms";
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
    codelistQuery?: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addSection("Allgemeines", [
        this.addTextArea("description", "Beschreibung", { required: true }),
        this.addAddressCard("addresses", "Adressen", {
          required: true,
          validators: {
            needPublisher: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.some((row) => row.type === "10")
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
        this.addTextArea("accessRights", "Nutzungshinweise"),
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
              type: "input",
              label: "Titel",
              focus: true,
              class: "flex-2",
              templateOptions: {
                label: "Titel",
                appearance: "outline",
              },
            },
            {
              key: "link",
              type: "upload",
              label: "Link",
              class: "flex-2",
              templateOptions: {
                label: "Link",
                appearance: "outline",
                required: true,

                onClick: (docUuid, uri, $event) => {
                  this.uploadService.downloadFile(docUuid, uri, $event);
                },
                formatter: (link: any, form: FormGroup) => {
                  if (link.asLink) {
                    return `<a href="${link.value}" target="_blank" class="no-text-transform">${link.value}</a>`;
                  } else {
                    return `<a href="${
                      this.configService.getConfiguration().backendUrl
                    }upload/${form.get("_uuid").value}/${
                      link.uri
                    }" class="no-text-transform">${link.uri}</a>`;
                  }
                },
              },
            },
            // this.addSelect("type", "Typ")
            {
              key: "type",
              type: "select",
              label: "Typ",
              templateOptions: {
                label: "Typ",
                appearance: "outline",
                required: true,
                options: this.getCodelistForSelect(20002, null),
                codelistId: 20002,
              },
            },
            {
              key: "format",
              type: "autocomplete",
              label: "Datenformat",
              wrappers: ["form-field"],
              templateOptions: {
                label: "Datenformat",
                appearance: "outline",
                options: this.getCodelistForSelect(20003, null),
              },
            },
          ],
        }),
        this.addAutocomplete("license", "Lizenz", {
          required: true,
          options: this.getCodelistForSelect(6500, "license"),
        }),
        this.addTextArea("origin", "Quellenvermerk"),
        this.addGroup(null, "mFUND", [
          this.addInput("mfundProject", null, {
            fieldLabel: "mFUND Projekt",
            hasInlineContextHelp: true,
            wrappers: ["form-field", "inline-help"],
          }),
          this.addInput("mfundFKZ", null, {
            fieldLabel: "mFUND Förderkennzeichen",
            hasInlineContextHelp: true,
            wrappers: ["form-field", "inline-help"],
          }),
        ]),
      ]),
      this.addSection("Raumbezüge", [this.addSpatial("spatial", "Raumbezüge")]),
      this.addSection("Zeitbezüge", [
        {
          key: "events",
          type: "repeat",
          wrappers: ["panel"],
          templateOptions: {
            externalLabel: "Zeitbezug der Ressource",
          },
          fieldArray: {
            fieldGroupClassName: "display-flex",
            fieldGroup: [
              this.addDatepicker("date", null, {
                fieldLabel: "Datum",
                required: true,
                wrappers: null,
              }),
              this.addSelect("text", "Typ", {
                required: true,
                className: "flex-1",
                wrappers: null,
                externalLabel: null,
                options: this.getCodelistForSelect(502, "text").pipe(
                  map((items) => items.filter((it) => it.value !== "2"))
                ),
              }),
            ],
          },
        },
        this.addGroup("temporal", "Zeitspanne", [
          this.addSelect("rangeType", null, {
            className: "flex-1",
            wrappers: null,
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
            wrappers: null,
            hideExpression: (model: any) =>
              model && model.rangeType === "range",
          }),
          this.addDateRange("timeSpanRange", null, {
            hideExpression: (model: any) =>
              model && model.rangeType !== "range",
          }),
        ]),
        this.addSelect("periodicity", "Periodizität", {
          options: this.getCodelistForSelectWithEmtpyOption(518, "periodicity"),
        }),
      ]),
    ];
}
