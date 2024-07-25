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
          placeholder: "https://...",
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
                'Fehler: Es muss eine Adresse als "veröffentlichende Stelle" eingetragen sein.',
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
          hint: "Mehrere Schlagworte durch Komma trennen und mit der Eingabetaste bestätigen.",
        }),
      ]),
      this.addSection("Open Data", [
        this.addRepeatList("DCATThemes", "Open Data Kategorien", {
          view: "chip",
          asSelect: true,
          required: true,
          options: this.getCodelistForSelect("20001", "DCATThemes"),
          codelistId: "20001",
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
              }),
              this.addSelectInline("format", "Format", {
                showSearch: true,
                options: this.getCodelistForSelect("20003", "type").pipe(
                  map((data) => {
                    return data;
                  }),
                ),
                codelistId: "20003",
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
              }),
              this.addRepeatListInline("languages", "Sprachen", {
                view: "chip",
                asSelect: true,
                placeholder: "Sprachen",
                options: this.getCodelistForSelect("20007", "null"),
                codelistId: "20007",
                wrappers: ["inline-help"],
                hasInlineContextHelp: true,
                contextHelpId: "language",
              }),
              this.addTextAreaInline("description", "Beschreibung", "bmi", {
                wrappers: ["form-field", "inline-help"],
                hasInlineContextHelp: true,
                contextHelpId: "distribution_description",
              }),
              this.addSelectInline("license", "Lizenz", {
                required: true,
                showSearch: true,
                options: this.getCodelistForSelect("20004", "null"),
                codelistId: "20004",
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
              }),
              this.addInputInline(
                "byClause",
                'Namensnennungstext für "By"-Clauses',
                {
                  wrappers: ["inline-help", "form-field"],
                  hasInlineContextHelp: true,
                },
              ),
              this.addSelectInline("availability", "geplante Verfügbarkeit", {
                options: this.getCodelistForSelect("20005", "null"),
                codelistId: "20005",
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
              }),
            ]),
          ],
          validators: {
            requiredEntry: {
              expression: (ctrl) => ctrl.value?.length > 0,
              message: "Fehler: Bitte erstellen Sie mindestens einen Eintrag",
            },
            requiredLicense: {
              expression: (ctrl) => ctrl.value?.every((entry) => entry.license),
              message:
                "Fehler: Es muss für jede Ressource eine Lizenz angegeben werden (Ressource bearbeiten).",
            },
          },
        }),
        this.addInput(
          "legalBasis",
          "Rechtsgrundlage für die Zugangseröffnung",
          {
            wrappers: ["panel", "form-field"],
          },
        ),
        this.addInput("qualityProcessURI", "Qualitätssicherungsprozess URI", {
          wrappers: ["panel", "form-field"],
        }),
      ]),
      this.addSection("Raumbezüge", [
        this.addSpatial("spatial", "Raumbezüge", {
          limitTypes: ["free", "wkt"],
        }),
        this.addSelect(
          "politicalGeocodingLevel",
          "Ebene der geopolitischen Abdeckung",
          {
            options: this.getCodelistForSelect("20006", "null"),
            codelistId: "20006",
          },
        ),
      ]),
      this.addSection("Zeitbezüge", [
        this.addGroup("temporal", "Zeitliche Abdeckung der Daten", [
          this.addSelect("rangeType", null, {
            showSearch: false,
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
            fieldLabel: "Datum",
            required: true,
            expressions: {
              hide: "model?.rangeType?.key == null || model?.rangeType?.key === 'range'",
            },
          }),
          this.addDateRange("timeSpanRange", null, {
            wrappers: [],
            fieldLabel: "Datum",
            required: true,
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

  addRepeatDistributionDetailList(
    id,
    label,
    options?: RepeatDetailListOptions,
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
        supportUpload: options?.supportLink ?? true,
        supportLink: options?.supportLink ?? true,
        backendUrl: this.configService.getConfiguration().backendUrl,
        infoText: options?.infoText,
        fields: options?.fields[0].fieldGroup,
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
