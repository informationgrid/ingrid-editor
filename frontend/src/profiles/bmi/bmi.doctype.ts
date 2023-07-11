import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseDoctype } from "../base.doctype";
import { inject, Injectable } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { UploadService } from "../../app/shared/upload/upload.service";
import { ConfigService } from "../../app/services/config/config.service";
import {map} from "rxjs/operators";
import {CodelistQuery} from "../../app/store/codelist/codelist.query";
import {RepeatDetailListOptions} from "../form-field-helper";

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
  protected codelistQuery = inject(CodelistQuery);

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
        this.addRepeatDistirbutionsDetailList("distributions", "Downloads", {
          required: true,
          fields: [
            this.addGroupSimple(null, [
              { key: "link" },
              this.addInputInline("title", "Titel", {
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
              }),
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
                  }
                },
              },
              this.addSelectInline("format", "Format", {
                showSearch: true,
                options: this.getCodelistForSelect(20003, "type").pipe(
                  map((data) => {
                    return data;
                  })
                ),
                codelistId: 20003,
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
              }),
              this.addRepeatListInline("languages", "Sprachen der Ressource", {
                view: "chip",
                asSelect: true,
                asSimpleValues: true,
                placeholder: "Sprachen der Ressource",
                options: this.getCodelistForSelect(
                  99999999,
                  "extraInfoLangData"
                ),
                codelistId: 99999999,
              }),
              this.addGroupSimple(null, [
                this.addTextAreaInline("description", "Beschreibung", {
                  wrappers: ["inline-help", "form-field"],
                  hasInlineContextHelp: true,
                }),
              ]),
              this.addSelectInline("license", "Lizenz", {
                required: true,
                options: this.getCodelistForSelect(20004, "null"),
                codelistId: 20004,
              }),
              this.addInputInline("byClause", "Namensnennungstext für \"By\"-Clauses", {
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
              }),
              this.addSelectInline("plannedAvailability", "geplante Verfügbarkeit", {
                options: this.getCodelistForSelect(20005, "null"),
                codelistId: 20005,
              }),
            ])
          ],
          validators: {
          },
        }),
        this.addTextArea(
          "legalBasis",
          "Rechtsgrundlage für die Zugangseröffnung",
          this.id
        ),
        this.addInput("qualityProcessURI", "Qualitätssicherungsprozess URI", {
          wrappers: ["panel", "form-field"],
        }),
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

  addRepeatDistirbutionsDetailList(
    id,
    label,
    options?: RepeatDetailListOptions
  ): FormlyFieldConfig {
    const expressions = this._initExpressions(options?.expressions);
    return {
      key: id,
      type: "repeatDistributionsDetailList",
      wrappers: options?.wrappers ?? ["panel"],
      className: options?.className,
      props: {
        externalLabel: label,
        required: options?.required,
      },
      fieldArray: {
        fieldGroup: options?.fields,
      },
      expressions: expressions,
      validators: options?.validators,
    };
  }

  private _initExpressions(expressions = {}) {
    return {
      "props.disabled": "formState.disabled",
      ...expressions,
    };
  }
}
