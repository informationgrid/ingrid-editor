import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseDoctype } from "../base.doctype";
import { inject, Injectable } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { UploadService } from "../../app/shared/upload/upload.service";
import { ConfigService } from "../../app/services/config/config.service";
import { map } from "rxjs/operators";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { RepeatDetailListOptions } from "../form-field-helper";

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
        this.addInput("landingPage", "Webseite", {
          wrappers: ["panel", "form-field"],
          validators: {
            validation: ["url"],
          },
        }),
        this.addAddressCard("addresses", "Adressen", {
          required: true,
          validators: {
            needPublisher: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.some((row) => row.type.key === "publisher")
                  : false,
              message:
                "Es muss die veröffentlichende Stelle als Adresse angegeben sein",
            },
            onePublisher: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.filter((row) => row.type.key === "publisher")
                      .length < 2
                  : true,
              message:
                "Es darf nur eine Adresse als veröffentlichende Stelle angegeben werden",
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
        this.addRepeatList("keywords", "Schlagworte", { view: "chip" }),
      ]),
      this.addSection("Open Data", [
        this.addRepeatList("DCATThemes", "Open Data Kategorien", {
          view: "chip",
          asSelect: true,
          required: true,
          options: this.getCodelistForSelect(20001, "DCATThemes"),
          codelistId: 20001,
        }),
        this.addRepeatDistributionDetailList("distributions", "Ressourcen", {
          required: true,
          fields: [
            this.addGroupSimple(null, [
              { key: "_title" },
              this.addInputInline("title", "Titel", {
                wrappers: ["inline-help", "form-field"],
              }),
              {
                key: "link",
                type: "upload",
                label: "Link",
                class: "flex-2",
                wrappers: ["inline-help"],
                hasInlineContextHelp: true,
                props: {
                  label: "Link",
                  appearance: "outline",
                  required: true,
                  validators: {
                    validation: ["url"],
                  },
                  onClick: (docUuid, uri, $event) => {
                    this.uploadService.downloadFile(docUuid, uri, $event);
                  },
                },
              },
              this.addDatepickerInline("modified", "Aktualisierungsdatum", {
                placeholder: "TT.MM.JJJJ",
                wrappers: ["form-field"],
              }),
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
                placeholder: "Sprachen der Ressource",
                options: this.getCodelistForSelect(20007, "null"),
                codelistId: 20007,
              }),
              this.addTextAreaInline("description", "Beschreibung", {
                wrappers: ["form-field"],
              }),
              this.addSelectInline("license", "Lizenz", {
                required: true,
                showSearch: true,
                options: this.getCodelistForSelect(20004, "null"),
                codelistId: 20004,
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
              }),
              this.addInputInline(
                "byClause",
                'Namensnennungstext für "By"-Clauses',
                {
                  wrappers: ["inline-help", "form-field"],
                  hasInlineContextHelp: true,
                }
              ),
              this.addSelectInline("availability", "geplante Verfügbarkeit", {
                options: this.getCodelistForSelect(20005, "null"),
                codelistId: 20005,
              }),
            ]),
          ],
          validators: {},
        }),
        this.addInput(
          "legalBasis",
          "Rechtsgrundlage für die Zugangseröffnung",
          {
            wrappers: ["panel", "form-field"],
          }
        ),
        this.addInput("qualityProcessURI", "Qualitätssicherungsprozess URI", {
          wrappers: ["panel", "form-field"],
        }),
      ]),
      this.addSection("Raumbezüge", [
        this.addSpatial("spatial", "Raumbezüge"),
        this.addSelect(
          "politicalGeocodingLevel",
          "Ebene der geopolitischen Abdeckung",
          {
            options: this.getCodelistForSelect(20006, "null"),
            codelistId: 20006,
          }
        ),
      ]),
      this.addSection("Zeitbezüge", [
        this.addGroup("temporal", "Zeitliche Abdeckung der Daten", [
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
            required: true,
            expressions: {
              hide: "model?.rangeType?.key == null || model?.rangeType?.key === 'range'",
            },
          }),
          this.addDateRange("timeSpanRange", null, {
            wrappers: [],
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

  addRepeatDistributionDetailList(
    id,
    label,
    options?: RepeatDetailListOptions
  ): FormlyFieldConfig {
    const expressions = this._initExpressions(options?.expressions);
    return {
      key: id,
      type: "repeatDistributionDetailList",
      wrappers: options?.wrappers ?? ["panel"],
      className: options?.className,
      props: {
        externalLabel: label,
        required: options?.required,
        backendUrl: this.configService.getConfiguration().backendUrl,
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
