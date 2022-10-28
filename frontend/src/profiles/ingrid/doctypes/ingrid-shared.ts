import { BaseDoctype } from "../../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { SelectOptionUi } from "../../../app/services/codelist/codelist.service";

interface GeneralSectionOptions {
  inspireRelevant?: boolean;
  openData?: boolean;
}

interface KeywordSectionOptions {
  priorityDataset?: boolean;
  spatialScope?: boolean;
  thesaurusTopics?: boolean;
}

interface AdditionalInformationSectionOptions {
  conformity?: boolean;
  extraInfoCharSetData?: boolean;
  extraInfoLangData?: boolean;
}

export abstract class IngridShared extends BaseDoctype {
  isAddressType = false;

  addGeneralSection(options: GeneralSectionOptions = {}): FormlyFieldConfig {
    return this.addSection("Allgemeines", [
      this.addGroup(
        null,
        "Info",
        [
          this.addInputInline(
            "parentUuid",
            "Identifikator des übergeordneten Metadatensatzes"
          ),
          this.addInputInline(
            "metadataDate",
            "Metadaten-Datum (veröffentlichte Version)"
          ),
        ],
        { hideExpression: "formState.hideOptionals" }
      ),
      this.addRepeatList("previewGraphic", "Vorschaugrafik", {
        hideExpression: "formState.hideOptionals",
      }),
      this.addInput("shortDescription", "Kurzbezeichnung", {
        wrappers: ["panel", "form-field"],
        hideExpression: "formState.hideOptionals",
      }),
      this.addTextArea("description", "Beschreibung", this.id, {
        required: true,
      }),
      this.addAddressCard("addresses", "Adressen"),
      this.addGroup(
        null,
        "Typ",
        [
          options.inspireRelevant
            ? this.addCheckbox("isInspireRelevant", "INSPIRE-relevant", {
                wrappers: ["form-field", "inline-help"],
                fieldLabel: "INSPIRE-relevant",
                className: "flex-1",
              })
            : null,
          this.addCheckbox("isAdVCompatible", "AdV kompatibel", {
            wrappers: ["form-field", "inline-help"],
            fieldLabel: "AdV kompatibel",
            className: "flex-1",
          }),
          options.openData
            ? this.addCheckbox("isOpenData", "Open Data", {
                wrappers: ["form-field", "inline-help"],
                fieldLabel: "Open Data",
                className: "flex-1",
              })
            : null,
        ].filter(Boolean)
      ),
    ]);
  }

  addKeywordsSection(options: KeywordSectionOptions = {}): FormlyFieldConfig {
    return this.addSection(
      "Verschlagwortung",
      [
        this.addRepeatList("advProductGroup", "AdV-Produktgruppe", {
          asSelect: true,
          options: this.getCodelistForSelect(8010, "advProductGroup"),
          codelistId: 8010,
          hideExpression: "formState.hideOptionals",
        }),
        this.addRepeatList("inspireTopics", "INSPIRE-Themen", {
          asSelect: true,
          options: this.getCodelistForSelect(6100, "inspireTopics"),
          codelistId: 6100,
          hideExpression: "formState.hideOptionals",
        }),
        // TODO: output needs to be formatted in a different way
        options.priorityDataset
          ? this.addRepeatList(
              "priorityDataset",
              "INSPIRE - priority data set",
              {
                asSelect: true,
                options: this.getCodelistForSelect(6350, "priorityDataset"),
                codelistId: 6350,
                hideExpression: "formState.hideOptionals",
              }
            )
          : null,
        options.spatialScope
          ? this.addSelect(
              "spatialScope",
              "INSPIRE - Räumlicher Anwendungsbereich",
              {
                options: this.getCodelistForSelect(6360, "spatialScope"),
                codelistId: 6360,
              }
            )
          : null,
        options.thesaurusTopics
          ? this.addRepeatList("thesaurusTopics", "ISO-Themenkategorie", {
              asSelect: true,
              options: this.getCodelistForSelect(527, "thesaurusTopics"),
              codelistId: 527,
            })
          : null,
        this.addRepeatChip("keywords", "Optionale Schlagworte"),
      ].filter(Boolean)
    );
  }

  addSpatialSection() {
    return this.addSection("Raumbezugssystem", [
      this.addSpatial("spatial", "Raumbezug"),
      this.addRepeatList("spatialSystems", "Raumbezugssysteme", {
        asSelect: true,
        options: this.getCodelistForSelect(100, "spatialSystems"),
        codelistId: 100,
        required: true,
      }),
      this.addGroup(
        null,
        "Höhe",
        [
          this.addGroup(
            null,
            null,
            [
              this.addInputInline("spatialRefAltMin", "Minimum"),
              this.addInput("spatialRefAltMax", null, {
                fieldLabel: "Maximum",
              }),
              this.addSelectInline("spatialRefAltMeasure", "Maßeinheit", {
                options: this.getCodelistForSelect(102, "spatialRefAltMeasure"),
                codelistId: 102,
              }),
            ],
            { wrappers: [] }
          ),
          this.addGroup(
            null,
            null,
            [
              this.addSelectInline("spatialRefAltVDate", "Vertikaldatum", {
                options: this.getCodelistForSelect(101, "spatialRefAltVDate"),
                codelistId: 101,
              }),
            ],
            { wrappers: [] }
          ),
        ],
        {
          fieldGroupClassName: null,
          hideExpression: "formState.hideOptionals",
        }
      ),
      this.addTextArea("spatialRefExplanation", "Erläuterungen", "spatial", {
        hideExpression: "formState.hideOptionals",
      }),
    ]);
  }

  addTimeReferenceSection() {
    return this.addSection("Zeitbezug", [
      this.addRepeat("timeRefTable", "Zeitbezug der Resource", {
        required: true,
        // wrappers: [],
        fields: [
          this.addDatepicker("date", null, {
            fieldLabel: "Datum",
            className: "flex-1",
            required: true,
            wrappers: ["form-field"],
          }),
          this.addSelect("type", null, {
            fieldLabel: "Typ",
            wrappers: null,
            className: "flex-3",
            required: true,
            options: this.getCodelistForSelect(502, "type"),
            codelistId: 502,
          }),
        ],
      }),
      this.addTextArea("timeRefExplanation", "Erläuterungen", "dataset", {
        hideExpression: "formState.hideOptionals",
      }),
      this.addGroup(
        null,
        "Durch die Ressource abgedeckte Zeitspanne",
        [
          this.addSelectInline("timeRefType", "Typ", {
            options: <SelectOptionUi[]>[
              { label: "am", value: "am" },
              { label: "bis", value: "bis" },
              { label: "von", value: "fromType" },
            ],
          }),
          this.addDatepicker("timeRefDate1", null, {
            wrappers: ["form-field"],
          }),
        ],
        { hideExpression: "formState.hideOptionals" }
      ),
      this.addSelect("timeRefStatus", "Status", {
        options: this.getCodelistForSelect(523, "timeRefStatus"),
        codelistId: 523,
        hideExpression: "formState.hideOptionals",
      }),
      this.addSelect("timeRefPeriodicity", "Periodizität", {
        options: this.getCodelistForSelect(518, "timeRefPeriodicity"),
        codelistId: 518,
        hideExpression: "formState.hideOptionals",
      }),
      this.addGroup(
        null,
        "Im Intervall",
        [
          this.addInputInline("timeRefIntervalNum", "Anzahl", {
            type: "number",
          }),
          this.addSelectInline("timeRefStatus", "Einheit", {
            options: this.getCodelistForSelect(1230, "timeRefStatus"),
            codelistId: 1230,
            className: "flex-3",
          }),
        ],
        { hideExpression: "formState.hideOptionals" }
      ),
    ]);
  }

  addAdditionalInformationSection(
    options: AdditionalInformationSectionOptions = {}
  ) {
    return this.addSection(
      "Zusatzinformation",
      [
        this.addSelect("extraInfoLangMetaData", "Sprache des Metadatensatzes", {
          options: this.getCodelistForSelect(99999999, "extraInfoLangMetaData"),
          codelistId: 99999999,
          required: true,
        }),
        this.addSelect("extraInfoPublishArea", "Veröffentlichung", {
          options: this.getCodelistForSelect(3571, "extraInfoPublishArea"),
          codelistId: 3571,
          required: true,
        }),
        options.extraInfoCharSetData
          ? this.addSelect(
              "extraInfoCharSetData",
              "Zeichensatz des Datensatzes",
              {
                options: this.getCodelistForSelect(510, "extraInfoCharSetData"),
                codelistId: 510,
                hideExpression: "formState.hideOptionals",
              }
            )
          : null,
        options.extraInfoLangData
          ? this.addRepeatList("extraInfoLangData", "Sprache der Ressource", {
              options: this.getCodelistForSelect(99999999, "extraInfoLangData"),
              codelistId: 99999999,
              required: true,
            })
          : null,
        options.conformity
          ? this.addTable("conformity", "Konformität", {
              supportUpload: false,
              hideExpression: "formState.hideOptionals",
              columns: [
                {
                  key: "specification",
                  type: "select",
                  label: "Spezifikation",
                  templateOptions: {
                    label: "Spezifikation",
                    appearance: "outline",
                    options: this.getCodelistForSelect(6005, "specification"),
                    codelistId: 6005, // TODO: can also be 6006 depending if it's INSPIRE!
                    formatter: (item: any) =>
                      this.formatCodelistValue("6005", item),
                  },
                },
                {
                  key: "level",
                  type: "select",
                  label: "Grad",
                  width: "100px",
                  templateOptions: {
                    label: "Grad",
                    appearance: "outline",
                    options: this.getCodelistForSelect(6000, "level"),
                    codelistId: 6000,
                    formatter: (item: any) =>
                      this.formatCodelistValue("6000", item),
                  },
                },
                {
                  key: "date",
                  type: "datepicker",
                  label: "Datum",
                  width: "100px",
                  templateOptions: {
                    label: "Datum",
                    appearance: "outline",
                    formatter: (date: Date) => {
                      return new Date(date).toLocaleDateString();
                    },
                  },
                },
                {
                  key: "explanation",
                  type: "input",
                  label: "geprüft mit",
                  width: "200px",
                  templateOptions: {
                    label: "geprüft mit",
                    appearance: "outline",
                  },
                },
              ],
            })
          : null,
        this.addRepeatList("extraInfoXMLExportTable", "XML-Export-Kriterium", {
          asSelect: true,
          options: this.getCodelistForSelect(1370, "extraInfoXMLExportTable"),
          codelistId: 1370,
          hideExpression: "formState.hideOptionals",
        }),
        this.addRepeatList(
          "extraInfoLegalBasicsTable",
          "Weitere Rechtliche Grundlagen",
          {
            asSelect: true,
            options: this.getCodelistForSelect(
              1350,
              "extraInfoLegalBasicsTable"
            ),
            codelistId: 1350,
            hideExpression: "formState.hideOptionals",
          }
        ),
        this.addGroup(
          null,
          "Weiteres",
          [
            this.addTextAreaInline(
              "extraInfoPurpose",
              "Herstellungszweck",
              "dataset"
            ),
            this.addTextAreaInline(
              "extraInfoUse",
              "Eignung/Nutzung",
              "dataset"
            ),
          ],
          { hideExpression: "formState.hideOptionals" }
        ),
      ].filter(Boolean)
    );
  }

  addAvailabilitySection() {
    return this.addSection("Verfügbarkeit", [
      this.addRepeatList(
        "availabilityAccessConstraints",
        "Zugriffsbeschränkungen",
        {
          asSelect: true, // TODO: also allow free values
          options: this.getCodelistForSelect(
            6010,
            "availabilityAccessConstraints"
          ),
          codelistId: 6010,
        }
      ),
      this.addRepeat(
        "availabilityUseAccessConstraints",
        "Nutzungsbedingungen",
        {
          required: true,
          fields: [
            this.addSelect("license", null, {
              options: this.getCodelistForSelect(6500, "license"),
              fieldLabel: "Lizenz",
              codelistId: 6500,
              wrappers: ["form-field"],
              className: "flex-1",
            }),
            this.addInput("source", null, {
              wrappers: ["form-field"],
              fieldLabel: "Quelle",
              className: "flex-1",
            }),
          ],
        }
      ),
      this.addTextArea(
        "availabilityUseConstraints",
        "Anwendungseinschränkungen",
        "dataset",
        { hideExpression: "formState.hideOptionals" }
      ),
      this.addTable("availabilityDataFormat", "Datenformat", {
        supportUpload: false,
        hideExpression: "formState.hideOptionals",
        columns: [
          {
            key: "name",
            type: "select",
            label: "Name",
            templateOptions: {
              label: "Name",
              appearance: "outline",
              options: this.getCodelistForSelect(1320, "specification"),
              codelistId: 1320,
              formatter: (item: any) => this.formatCodelistValue("1320", item),
            },
          },
          {
            key: "version",
            type: "input",
            label: "Version",
            width: "100px",
            templateOptions: {
              label: "Version",
              appearance: "outline",
            },
          },
          {
            key: "compression",
            type: "input",
            label: "Kompressionstechnik",
            width: "100px",
            templateOptions: {
              label: "Kompressionstechnik",
              appearance: "outline",
            },
          },
          {
            key: "specification",
            type: "input",
            label: "Spezifikation",
            width: "200px",
            templateOptions: {
              label: "Spezifikation",
              appearance: "outline",
            },
          },
        ],
      }),
      this.addTable("availabilityMediaOptions", "Medienoption", {
        supportUpload: false,
        hideExpression: "formState.hideOptionals",
        columns: [
          {
            key: "medium",
            type: "select",
            label: "Medium",
            templateOptions: {
              label: "Medium",
              appearance: "outline",
              options: this.getCodelistForSelect(520, "specification"),
              codelistId: 520,
              formatter: (item: any) => this.formatCodelistValue("520", item),
            },
          },
          {
            key: "volume",
            type: "input",
            label: "Datenvolumen (MB)",
            width: "100px",
            templateOptions: {
              label: "Datenvolumen (MB)",
              appearance: "outline",
            },
          },
          {
            key: "location",
            type: "input",
            label: "Speicherort",
            width: "100px",
            templateOptions: {
              label: "Speicherort",
              appearance: "outline",
            },
          },
        ],
      }),
      this.addTextArea(
        "availabilityOrderInfo",
        "Bestellinformation",
        "dataset",
        { hideExpression: "formState.hideOptionals" }
      ),
    ]);
  }

  addLinksSection() {
    return this.addSection("Verweise", [
      this.addTable("linksTo", "Verweise", {
        supportUpload: false,
        hideExpression: "formState.hideOptionals",
        columns: [],
      }),
    ]);
  }
}
