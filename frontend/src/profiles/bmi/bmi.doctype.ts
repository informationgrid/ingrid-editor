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
                "Fehler: Es muss die veröffentlichende Stelle als Adresse angegeben sein",
            },
            onePublisher: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.filter((row) => row.type.key === "publisher")
                      .length < 2
                  : true,
              message:
                "Fehler: Es darf nur eine Adresse als veröffentlichende Stelle angegeben werden",
            },
            publisherPublished: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.every((row) => row.ref._state === "P")
                  : false,
              message: "Fehler: Alle Adressen müssen veröffentlicht sein",
            },
          },
        }),
        this.addRepeatList("keywords", "Schlagworte", {
          view: "chip",
          hint: "Mehrere Schlagworte durch Komma trennen, Eingabe mit Enter bestätigen.",
        }),
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
          infoText:
            "Nutzen Sie soweit möglich maschinenlesbare Dateiformate für Ihre Daten.",
          fields: [
            this.addGroupSimple(null, [
              { key: "_title" },
              this.addInputInline("title", "Titel", {
                contextHelpId: "distribution_title",
                hasInlineContextHelp: true,
                wrappers: ["inline-help", "form-field"],
                ariaLabel: "Titel der Ressource",
              }),
              {
                key: "link",
                type: "upload",
                label: "Link",
                class: "flex-2",
                wrappers: ["form-field", "inline-help"],
                props: {
                  label: "Link",
                  appearance: "outline",
                  required: true,
                  hasInlineContextHelp: true,
                  contextHelpId: "distribution_link",
                  validators: {
                    validation: ["url"],
                  },
                  onClick: (docUuid, uri, $event) => {
                    this.uploadService.downloadFile(docUuid, uri, $event);
                  },
                  ariaLabel: "URL der Ressource",
                },
                expressions: {
                  "props.label": (field) =>
                    field.formControl.value?.asLink
                      ? "URL (Link)"
                      : "Dateiname (Upload)",
                },
              },
              this.addDatepickerInline("modified", "Aktualisierungsdatum", {
                placeholder: "TT.MM.JJJJ",
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
                contextHelpId: "distribution_modified",
                ariaLabel: "Aktualisierungsdatum der Ressource",
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
                ariaLabel: "Format der Ressource",
              }),
              this.addRepeatListInline("languages", "Sprachen der Ressource", {
                view: "chip",
                asSelect: true,
                placeholder: "Sprachen der Ressource",
                options: this.getCodelistForSelect(20007, "null"),
                codelistId: 20007,
                wrappers: ["inline-help"],
                hasInlineContextHelp: true,
                contextHelpId: "language",
              }),
              this.addTextAreaInline("description", "Beschreibung", "bmi", {
                wrappers: ["form-field", "inline-help"],
                hasInlineContextHelp: true,
                contextHelpId: "distribution_description",
                ariaLabel: "Beschreibung der Ressource",
              }),
              this.addSelectInline("license", "Lizenz", {
                required: true,
                showSearch: true,
                options: this.getCodelistForSelect(20004, "null"),
                codelistId: 20004,
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
                ariaLabel: "Lizenz der Ressource",
              }),
              this.addInputInline(
                "byClause",
                'Namensnennungstext für "By"-Clauses',
                {
                  wrappers: ["inline-help", "form-field"],
                  hasInlineContextHelp: true,
                  ariaLabel:
                    'Namensnennungstext für "By"-Clauses der Ressource',
                }
              ),
              this.addSelectInline("availability", "geplante Verfügbarkeit", {
                options: this.getCodelistForSelect(20005, "null"),
                codelistId: 20005,
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
                ariaLabel: "Geplante Verfügbarkeit der Ressource",
              }),
            ]),
          ],
          validators: {
            requiredLicense: {
              expression: (ctrl) => ctrl.value?.every((entry) => entry.license),
              message:
                "Fehler: Es muss für jede Ressource eine Lizenz angegeben werden.",
            },
          },
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
            ariaLabel: "Zeitliche Abdeckung der Daten",
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
            ariaLabel: "Zeitliche Abdeckung der Daten",
            expressions: {
              hide: "model?.rangeType?.key == null || model?.rangeType?.key === 'range'",
            },
          }),
          this.addDateRange("timeSpanRange", null, {
            wrappers: [],
            required: true,
            ariaLabel: "Zeitliche Abdeckung der Daten",
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
        infoText: options?.infoText,
        ariaLabel: options?.ariaLabel ?? label,
        ariaDescription: options?.ariaDescription,
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
