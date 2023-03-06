import { BaseDoctype } from "../../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { ConformityDialogComponent } from "../dialogs/conformity-dialog.component";
import { isEmptyObject } from "../../../app/shared/utils";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../app/dialogs/confirm/confirm-dialog.component";
import { CookieService } from "../../../app/services/cookie.service";
import { FormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";

interface GeneralSectionOptions {
  additionalGroup?: FormlyFieldConfig;
  inspireRelevant?: boolean;
  openData?: boolean;
}

interface KeywordSectionOptions {
  priorityDataset?: boolean;
  spatialScope?: boolean;
  thesaurusTopics?: boolean;
}

interface SpatialOptions {
  regionKey?: boolean;
}

interface AdditionalInformationSectionOptions {
  conformity?: boolean;
  extraInfoCharSetData?: boolean;
  extraInfoLangData?: boolean;
}

export abstract class IngridShared extends BaseDoctype {
  isAddressType = false;

  private inspireChangeMessage =
    "ACHTUNG: Grad der Konformität zur INSPIRE-Spezifikation im Bereich 'Zusatzinformationen' wird geändert.";
  private inspireDeleteMessage =
    "ACHTUNG: Der Eintrag in Konformität zur INSPIRE-Spezifikation im Bereich 'Zusatzinformationen' wird gelöscht.";
  private openDataMessage =
    "<br><br>Wird diese Auswahl gewählt, so werden alle Zugriffsbeschränkungen entfernt. Möchten Sie fortfahren?";

  constructor(
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    private uploadService: UploadService,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private snack: MatSnackBar
  ) {
    super(codelistService, codelistQuery);
  }

  addGeneralSection(options: GeneralSectionOptions = {}): FormlyFieldConfig {
    return this.addGroupSimple(
      null,
      [
        this.addGroup(
          null,
          "Typ",
          [
            options.inspireRelevant
              ? this.addCheckboxInline(
                  "isInspireIdentified",
                  "INSPIRE-relevant",
                  {
                    className: "flex-1",
                    click: (field) => this.handleInspireIdentifiedClick(field),
                  }
                )
              : null,
            this.addCheckboxInline("isAdVCompatible", "AdV kompatibel", {
              className: "flex-1",
              click: (field) => this.handleAdvClick(field),
            }),
            options.openData
              ? this.addCheckboxInline("isOpenData", "Open Data", {
                  className: "flex-1",
                  click: (field) => this.handleOpenDataClick(field),
                })
              : null,
          ].filter(Boolean)
        ),
        this.addRadioboxes("isInspireConform", "INSPIRE konform", {
          expressions: {
            hide: "!(model._type === 'InGridGeoDataset' && model.isInspireIdentified)",
          },
          options: [
            {
              value: "Ja",
              id: true,
            },
            {
              value: "Nein",
              id: false,
            },
          ],
          click: (field) =>
            setTimeout(() => this.handleIsInspireConformClick(field)),
        }),
        options.additionalGroup ? options.additionalGroup : null,
        this.addSection("Allgemeines", [
          this.addGroup(
            null,
            "Info",
            [
              this.addInputInline(
                "parentIdentifier",
                "Identifikator des übergeordneten Metadatensatzes",
                {
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }
              ),
              this.addInputInline(
                "modifiedMetadata",
                "Metadaten-Datum (veröffentlichte Version)",
                {
                  expressions: {
                    // since whole form will be disabled/enabled by application
                    // depending on write access, we need to set disabled state dynamically
                    "props.disabled": () => true,
                  },
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }
              ),
            ],
            { className: "optional" }
          ),
          this.addTable("graphicOverviews", "Vorschaugrafik", {
            className: "optional",
            columns: [
              {
                key: "fileName",
                type: "upload",
                label: "URI",
                props: {
                  label: "URI",
                  appearance: "outline",
                  onClick: (docUuid, uri, $event) => {
                    this.uploadService.downloadFile(docUuid, uri, $event);
                  },
                  formatter: (link: any) => {
                    if (link.asLink) {
                      return `<a  href="${link.uri}" target="_blank" class="no-text-transform icon-in-table">
                         <img  width="20"  height="20" src="assets/icons/external_link.svg"  alt="link"> ${link.uri}  </a> `;
                    } else {
                      return `<span class="clickable-text icon-in-table">  <img  width="20"  height="20" src="assets/icons/download.svg"  alt="link"> ${link.uri}</span>`;
                    }
                  },
                },
              },
              {
                key: "fileDescription",
                type: "input",
                label: "Beschreibung",
                props: {
                  label: "Beschreibung",
                  appearance: "outline",
                },
              },
            ],
          }),
          this.addInput("alternateTitle", "Kurzbezeichnung", {
            wrappers: ["panel", "form-field"],
            className: "optional",
          }),
          this.addTextArea("description", "Beschreibung", this.id, {
            required: true,
          }),
          this.addAddressCard("pointOfContact", "Adressen", {
            required: true,
          }),
        ]),
      ].filter(Boolean)
    );
  }

  private handleOpenDataClick(field) {
    const isChecked = field.formControl.value;
    if (!isChecked) return;

    const cookieId = "HIDE_OPEN_DATA_INFO";
    const isInspire = field.model.isInspireIdentified;

    function executeAction() {
      if (isInspire) {
        field.model.resource.accessConstraints = [{ key: "1" }];
      } else {
        field.model.resource.accessConstraints = [];
      }
      field.options.formState.updateModel();
    }

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return;
    }

    const message = isInspire
      ? "Wird diese Auswahl gewählt, so werden alle Zugriffsbeschränkungen entfernt und durch 'Es gelten keine Zugriffsbeschränkungen' ersetzt. Möchten Sie fortfahren?"
      : "Wird diese Auswahl gewählt, so werden alle Zugriffsbeschränkungen entfernt. Möchten Sie fortfahren?";
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: message,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .subscribe((decision) => {
        if (decision === "ok") executeAction();
        else field.formControl.setValue(false);
      });
  }

  addKeywordsSection(options: KeywordSectionOptions = {}): FormlyFieldConfig {
    return this.addSection(
      "Verschlagwortung",
      [
        this.addRepeatList("advProductGroups", "AdV-Produktgruppe", {
          asSelect: true,
          showSearch: true,
          options: this.getCodelistForSelect(8010, "advProductGroups"),
          codelistId: 8010,
          className: "optional",
          expressions: {
            "props.required": "formState.mainModel?.isAdVCompatible",
          },
        }),
        this.addRepeatList("themes", "INSPIRE-Themen", {
          asSelect: true,
          showSearch: true,
          options: this.getCodelistForSelect(6100, "themes"),
          codelistId: 6100,
          className: "optional",
          expressions: {
            "props.required": "formState.mainModel?.isInspireIdentified",
          },
        }),
        this.addRepeatList("openDataCategories", "OpenData - Kategorien", {
          required: true,
          asSelect: true,
          showSearch: true,
          options: this.getCodelistForSelect(6400, "openDataCategories"),
          codelistId: 6400,
          expressions: { hide: "!formState.mainModel?.isOpenData" },
        }),
        // TODO: output needs to be formatted in a different way
        options.priorityDataset
          ? this.addRepeatList(
              "priorityDatasets",
              "INSPIRE - priority data set",
              {
                asSelect: true,
                showSearch: true,
                options: this.getCodelistForSelect(6350, "priorityDatasets"),
                codelistId: 6350,
                expressions: {
                  className: (model) =>
                    model.options.formState.mainModel?.isInspireIdentified
                      ? ""
                      : "optional",
                },
              }
            )
          : null,
        options.spatialScope // TODO: check if hide can be simplified
          ? this.addSelect(
              "spatialScope",
              "INSPIRE - Räumlicher Anwendungsbereich",
              {
                showSearch: true,
                options: this.getCodelistForSelect(6360, "spatialScope"),
                codelistId: 6360,
                expressions: {
                  "props.required":
                    "formState.mainModel?._type === 'InGridGeoDataset' && formState.mainModel?.isInspireIdentified",
                  className: (model) =>
                    !model.options.formState.mainModel?.isInspireIdentified &&
                    model.options.formState.mainModel?._type ===
                      "InGridGeoService"
                      ? "optional"
                      : "",
                },
              }
            )
          : null,
        options.thesaurusTopics
          ? this.addRepeatList("topicCategories", "ISO-Themenkategorie", {
              asSelect: true,
              showSearch: true,
              options: this.getCodelistForSelect(527, "topicCategories"),
              codelistId: 527,
              required: true,
            })
          : null,
        this.addRepeatChip("keywords", "Optionale Schlagworte"),
      ].filter(Boolean)
    );
  }

  addSpatialSection(options: SpatialOptions = {}) {
    return this.addSection("Raumbezug", [
      this.addGroupSimple(
        "spatial",
        [
          this.addSpatial("references", "Raumbezug", {
            required: true,
            hasInlineContextHelp: true,
          }),
          options.regionKey
            ? this.addInput("regionKey", "Regionalschlüssel", {
                wrappers: ["panel", "form-field"],
              })
            : null,
          this.addRepeatList("spatialSystems", "Raumbezugssysteme", {
            asSelect: true,
            showSearch: true,
            options: this.getCodelistForSelect(100, "spatialSystems"),
            codelistId: 100,
            required: true,
          }),
          this.addGroup(
            "verticalExtent",
            "Höhe",
            [
              this.addGroup(
                null,
                null,
                [
                  this.addInputInline("minimumValue", "Minimum", {
                    type: "number",
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                    expressions: {
                      "props.required": (field) =>
                        isEmptyObject(field.form.value),
                    },
                  }),
                  this.addInputInline("maximumValue", "Maximum", {
                    type: "number",
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                    expressions: {
                      "props.required": (field) =>
                        isEmptyObject(field.form.value),
                    },
                  }),
                  this.addSelectInline("unitOfMeasure", "Maßeinheit", {
                    options: this.getCodelistForSelect(
                      102,
                      "spatialRefAltMeasure"
                    ),
                    codelistId: 102,
                    showSearch: true,
                    allowNoValue: true,
                    wrappers: ["inline-help", "form-field"],
                    hasInlineContextHelp: true,
                    expressions: {
                      "props.required": (field) =>
                        isEmptyObject(field.form.value),
                    },
                  }),
                ],
                {
                  wrappers: [],
                  validators: {
                    bigger: {
                      expression: (a, b) => {
                        return (
                          !b.model?.minimumValue ||
                          b.model?.minimumValue <= b.model?.maximumValue
                        );
                      },
                      message: () => "Der Wert muss größer als Minimum sein",
                      errorPath: "maximumValue",
                    },
                  },
                }
              ),
              this.addGroup(
                null,
                null,
                [
                  this.addAutoCompleteInline("Datum", "Vertikaldatum", {
                    options: this.getCodelistForSelect(
                      101,
                      "spatialRefAltVDate"
                    ),
                    codelistId: 101,
                    expressions: {
                      "props.required": (field) =>
                        isEmptyObject(field.form.value),
                    },
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                  }),
                ],
                { wrappers: [], hasInlineContextHelp: true }
              ),
            ],
            {
              fieldGroupClassName: "",
              className: "optional",
            }
          ),
          this.addTextArea("description", "Erläuterungen", "spatial", {
            className: "optional flex-1",
            contextHelpId: "descriptionSpacial",
          }),
        ].filter(Boolean)
      ),
    ]);
  }

  addTimeReferenceSection() {
    return this.addSection("Zeitbezug", [
      this.addGroupSimple("temporal", [
        this.addRepeat("events", "Zeitbezug der Resource", {
          required: true,
          fields: [
            this.addDatepicker("referenceDate", null, {
              fieldLabel: "Datum",
              className: "flex-1",
              required: true,
              wrappers: ["form-field"],
            }),
            this.addSelect("referenceDateType", null, {
              showSearch: true,
              fieldLabel: "Typ",
              wrappers: null,
              className: "flex-3",
              required: true,
              options: this.getCodelistForSelect(502, "type"),
              codelistId: 502,
            }),
          ],
        }),
        this.addGroup(
          null,
          "Durch die Ressource abgedeckte Zeitspanne",
          [
            this.addSelect("resourceDateType", null, {
              showSearch: true,
              // className: "flex-1",
              wrappers: ["form-field"],
              options: [
                { label: "", value: undefined },
                { label: "am", value: "at" },
                { label: "bis", value: "till" },
                { label: "von", value: "since" },
              ],
            }),
            this.addSelect("resourceDateTypeSince", null, {
              showSearch: true,
              // className: "flex-1",
              wrappers: ["form-field"],
              options: [
                { label: "", value: undefined },
                { label: "bis: unbekannter Zeitpunkt", value: "unknown" },
                { label: "bis: Zeitpunkt des Abrufs", value: "requestTime" },
                { label: "bis: genaues Datum", value: "exactDate" },
              ],
              expressions: {
                hide: "formState.mainModel?.temporal?.resourceDateType?.key !== 'since'",
              },
            }),
            this.addDatepicker("resourceDate", null, {
              placeholder: "TT.MM.JJJJ",
              wrappers: ["form-field"],
              expressions: {
                hide: "formState.mainModel?.temporal?.resourceDateTypeSince?.key === 'exactDate'",
              },
            }),
            this.addDateRange("resourceRange", null, {
              wrappers: [],
              expressions: {
                hide: "formState.mainModel?.temporal?.resourceDateTypeSince?.key !== 'exactDate'",
              },
            }),
          ],
          {
            className: "optional",
            contextHelpId: "resourceTime",
          }
        ),
        this.addSelect("status", "Status", {
          showSearch: true,
          options: this.getCodelistForSelect(523, "timeRefStatus"),
          codelistId: 523,
          className: "optional",
        }),
      ]),
      this.addGroupSimple("maintenanceInformation", [
        this.addSelect("maintenanceAndUpdateFrequency", "Periodizität", {
          showSearch: true,
          options: this.getCodelistForSelect(518, "timeRefPeriodicity"),
          codelistId: 518,
          className: "optional",
        }),
        this.addGroup(
          "userDefinedMaintenanceFrequency",
          "Im Intervall",
          [
            this.addInputInline("number", "Anzahl", {
              type: "number",
              expressions: {
                "props.required": (field) => isEmptyObject(field.form.value),
              },
            }),
            this.addSelectInline("unit", "Einheit", {
              showSearch: true,
              options: this.getCodelistForSelect(1230, "timeRefStatus"),
              codelistId: 1230,
              className: "flex-3",
              allowNoValue: true,
              expressions: {
                "props.required": (field) => isEmptyObject(field.form.value),
              },
            }),
          ],
          { className: "optional" }
        ),
        this.addTextArea("description", "Erläuterungen", "dataset", {
          className: "optional flex-1",
        }),
      ]),
    ]);
  }

  addAdditionalInformationSection(
    options: AdditionalInformationSectionOptions = {}
  ) {
    return this.addSection(
      "Zusatzinformation",
      [
        this.addGroupSimple("metadata", [
          this.addGroup(
            null,
            "Sprache / Zeichensatz",
            [
              this.addSelectInline("language", "Sprache des Metadatensatzes", {
                showSearch: true,
                options: this.getCodelistForSelect(
                  99999999,
                  "extraInfoLangMetaData"
                ),
                codelistId: 99999999,
                required: true,
              }),
              options.extraInfoCharSetData
                ? this.addSelectInline(
                    "characterSet",
                    "Zeichensatz des Datensatzes",
                    {
                      showSearch: true,
                      options: this.getCodelistForSelect(510, "characterSet"),
                      codelistId: 510,
                      className: "optional",
                    }
                  )
                : null,
            ].filter(Boolean),
            { hasInlineContextHelp: true, contextHelpId: "languageInfo" }
          ),
        ]),
        this.addSelect("extraInfoPublishArea", "Veröffentlichung", {
          showSearch: true,
          options: this.getCodelistForSelect(3571, "extraInfoPublishArea"),
          codelistId: 3571,
          required: true,
        }),
        options.extraInfoLangData
          ? this.addGroupSimple("dataset", [
              this.addRepeatChip("languages", "Sprache der Ressource", {
                options: this.getCodelistForSelect(
                  99999999,
                  "extraInfoLangData"
                ),
                codelistId: 99999999,
                useDialog: true,
                required: true,
                className: "optional",
                expressions: {
                  "props.required":
                    "['InGridGeoDataset', 'InGridLiterature', 'InGridDataCollection'].indexOf(formState.mainModel?._type) !== -1",
                },
              }),
            ])
          : null,
        options.conformity
          ? this.addTable("conformanceResult", "Konformität", {
              supportUpload: false,
              className: "optional",
              expressions: {
                "props.required": "formState.mainModel?.isInspireIdentified",
              },
              dialog: ConformityDialogComponent,
              columns: [
                {
                  key: "specification",
                  type: "select",
                  label: "Spezifikation",
                  props: {
                    label: "Spezifikation",
                    appearance: "outline",
                    // needed just to wait for codelist being loaded
                    options: this.getCodelistForSelect(6005, "specification"),
                    formatter: (item: any, form: any, row: any) =>
                      this.formatCodelistValue(
                        row.isInspire ? "6005" : "6006",
                        item
                      ),
                  },
                },
                {
                  key: "pass",
                  type: "select",
                  label: "Grad",
                  width: "100px",
                  props: {
                    label: "Grad",
                    appearance: "outline",
                    options: this.getCodelistForSelect(6000, "level"),
                    codelistId: 6000,
                    formatter: (item: any) =>
                      this.formatCodelistValue("6000", item),
                  },
                },
                {
                  key: "publicationDate",
                  type: "datepicker",
                  label: "Datum",
                  width: "100px",
                  props: {
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
                  props: {
                    label: "geprüft mit",
                    appearance: "outline",
                  },
                },
                {
                  key: "inspire",
                  type: "checkbox",
                  hidden: true,
                  props: {
                    hidden: true,
                  },
                },
              ],
              validators: {
                inspireConformGeoservice: {
                  expression: (ctrl, field) => {
                    const model = field.options.formState.mainModel;
                    return (
                      !model ||
                      model._type !== "InGridGeoService" ||
                      !model.isInspireConform ||
                      this.conformityExists(ctrl, "10", "1")
                    );
                  },
                  message:
                    "Die Konformität 'VERORDNUNG (EG) Nr. 976/2009...' muss vorhanden sein und den Wert 'konform' haben",
                },
                inspireConformGeodataset: {
                  expression: (ctrl, field) => {
                    const model = field.options.formState.mainModel;
                    return (
                      !model ||
                      model._type !== "InGridGeoDataset" ||
                      !model.isInspireConform ||
                      this.conformityExists(ctrl, "12", "1")
                    );
                  },
                  message:
                    "Die Konformität 'VERORDNUNG (EG) Nr. 1089/2010...' muss vorhanden sein und den Wert 'konform' haben",
                },
                inspireNotConformGeodataset: {
                  expression: (ctrl, field) => {
                    const model = field.options.formState.mainModel;
                    return (
                      !model ||
                      model._type !== "InGridGeoDataset" ||
                      model.isInspireConform ||
                      !this.conformityExists(ctrl, "12", "1")
                    );
                  },
                  message:
                    "Die Konformität 'VERORDNUNG (EG) Nr. 1089/2010...' muss vorhanden sein und der Wert darf nicht 'konform' sein",
                },
              },
            })
          : null,
        this.addGroupSimple("extraInfo", [
          this.addRepeatList(
            "legalBasicsDescriptions",
            "Weitere Rechtliche Grundlagen",
            {
              asSelect: false,
              showSearch: true,
              options: this.getCodelistForSelect(
                1350,
                "extraInfoLegalBasicsTable"
              ),
              codelistId: 1350,
              className: "optional",
            }
          ),
        ]),
        this.addGroup(
          "resource",
          "Weiteres",
          [
            this.addTextAreaInline("purpose", "Herstellungszweck", "dataset", {
              hasInlineContextHelp: true,
              wrappers: ["inline-help", "form-field"],
            }),
            this.addTextAreaInline(
              "specificUsage",
              "Eignung/Nutzung",
              "dataset",
              {
                hasInlineContextHelp: true,
                wrappers: ["inline-help", "form-field"],
              }
            ),
          ],
          { className: "optional" }
        ),
      ].filter(Boolean)
    );
  }

  addAvailabilitySection() {
    return this.addSection("Verfügbarkeit", [
      this.addGroupSimple("resource", [
        this.addRepeatList("accessConstraints", "Zugriffsbeschränkungen", {
          asSelect: false,
          showSearch: true,
          required: true,
          options: this.getCodelistForSelect(
            6010,
            "availabilityAccessConstraints"
          ),
          codelistId: 6010,
          className: "optional",
          expressions: {
            "props.required": "formState.mainModel?.isInspireIdentified",
          },
        }),
        this.addRepeat("useConstraints", "Nutzungsbedingungen", {
          // className: "optional",
          expressions: {
            "props.required":
              "formState.mainModel?._type === 'InGridGeoDataset' || formState.mainModel?._type === 'InGridGeoService'",
          },
          fields: [
            this.addAutocomplete("title", null, {
              required: true,
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
        }),
        this.addTextArea(
          "useLimitation",
          "Anwendungseinschränkungen",
          "dataset",
          {
            className: "optional flex-1",
          }
        ),
      ]),
      this.addGroupSimple("distribution", [
        this.addRepeat("format", "Datenformat", {
          className: "optional",
          expressions: {
            hide: `formState.mainModel?._type !== 'InGridGeoService'`, // TODO: simplify!
            "props.required":
              "formState.mainModel?._type === 'InGridGeoDataset' && formState.mainModel?.isInspireIdentified",
          },
          fields: [
            this.addAutoCompleteInline("name", "Name", {
              options: this.getCodelistForSelect(1320, "specification"),
              codelistId: 1320,
            }),
            this.addInputInline("version", "Version"),
            this.addInputInline("compression", "Kompressionstechnik"),
            this.addInputInline("specification", "Spezifikation"),
          ],
        }),
      ]),
      this.addRepeat("digitalTransferOptions", "Medienoption", {
        className: "optional",
        fields: [
          this.addSelectInline("name", "Medium", {
            showSearch: true,
            options: this.getCodelistForSelect(520, "specification"),
            codelistId: 520,
          }),
          this.addInputInline("transferSize", "Datenvolumen (MB)", {
            type: "number",
          }),
          this.addInputInline("mediumNote", "Speicherort"),
        ],
      }),
      this.addTextArea("orderInfo", "Bestellinformation", "dataset", {
        className: "optional flex-1",
      }),
    ]);
  }

  addLinksSection() {
    return this.addSection("Verweise", [
      this.addRepeat("references", "Verweise", {
        fieldGroupClassName: "display-flex flex-column",
        fields: [this.urlRefFields()],
        validators: {
          downloadLinkWhenOpenData: {
            expression: (ctrl, field) =>
              !field.form.value.isOpenData ||
              ctrl.value.some((row) => row.type?.key === "9990"), // Datendownload
            message:
              "Bei aktivierter 'Open Data'-Checkbox muss mindestens ein Link vom Typ 'Datendownload' angegeben sein",
          },
        },
      }),
    ]);
  }

  protected urlRefFields() {
    return this.addGroupSimple(null, [
      { key: "_type" },
      this.addGroupSimple(
        null,
        [
          this.addSelectInline("type", "Typ", {
            showSearch: true,
            required: true,
            options: this.getCodelistForSelect(2000, "type"),
            codelistId: 2000,
            wrappers: ["inline-help", "form-field"],
            hasInlineContextHelp: true,
          }),
          this.addInputInline("title", "Titel", {
            required: true,
            className: "flex-2",
            wrappers: ["inline-help", "form-field"],
            hasInlineContextHelp: true,
          }),
        ],
        { fieldGroupClassName: "display-flex" }
      ),
      this.addInputInline("url", "URL", {
        required: true,
        wrappers: ["inline-help", "form-field"],
        hasInlineContextHelp: true,
      }),
      this.addGroupSimple(null, [
        this.addTextAreaInline("explanation", "Erläuterungen", {
          wrappers: ["inline-help", "form-field"],
          hasInlineContextHelp: true,
        }),
      ]),
    ]);
  }

  protected titleDateEditionFields(codelistForTitle: number) {
    return [
      this.addAutocomplete("title", "Titel", {
        className: "flex-3",
        wrappers: ["form-field"],
        required: true,
        options: this.getCodelistForSelect(codelistForTitle, "title"),
        codelistId: codelistForTitle,
      }),
      { key: "_type" },
      this.addDatepickerInline("date", "Datum", {
        className: "flex-1",
        required: true,
      }),
      this.addInputInline("edition", "Version", {
        className: "flex-1",
      }),
    ];
  }

  private handleInspireIdentifiedClick(field) {
    const checked = field.formControl.value;
    if (checked) {
      this.handleActivateInspireIdentified(field);
    } else {
      this.handleDeactivateInspireIdentified(field);
    }
  }

  private handleActivateInspireIdentified(field) {
    const cookieId = "HIDE_INSPIRE_INFO";
    const isOpenData = field.model.isOpenData === true;

    const executeAction = () => {
      const isGeoService = field.model._type === "InGridGeoService";
      const isGeoDataset = field.model._type === "InGridGeoDataset";

      field.model.isInspireConform = true;

      if (isGeoService) {
        if (isOpenData) {
          field.model.resource.accessConstraints = [{ key: "1" }];
        }

        this.addConformanceEntry(field.model, "10", "1");
      } else if (isGeoDataset) {
        field.model.spatialScope = { key: "885989663" }; // Regional

        this.addConformanceEntry(field.model, "12", "1");
      }

      field.options.formState.updateModel();
    };

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return;
    }

    const openDataMessage =
      "<br><br>Wird diese Auswahl gewählt, so werden alle Zugriffsbeschränkungen entfernt und durch 'keine' ersetzt. Möchten Sie fortfahren?";
    const message =
      this.inspireChangeMessage + (isOpenData ? openDataMessage : "");

    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: message,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .subscribe((decision) => {
        if (decision === "ok") executeAction();
        else field.formControl.setValue(false);
      });
  }

  private handleDeactivateInspireIdentified(field) {
    const cookieId = "HIDE_INSPIRE_DEACTIVATE_INFO";
    const isOpenData = field.model.isOpenData === true;
    const isGeoService = field.model._type === "InGridGeoService";
    const specificationToRemove = isGeoService ? "10" : "12";

    const executeAction = () => {
      if (isOpenData) field.model.resource.accessConstraints = [];

      field.model.conformanceResult = (
        field.model.conformanceResult ?? []
      ).filter((item) => item.specification?.key !== specificationToRemove);
      field.options.formState.updateModel();
    };

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return;
    }

    const message =
      this.inspireDeleteMessage + (isOpenData ? this.openDataMessage : "");

    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: message,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .subscribe((decision) => {
        if (decision === "ok") executeAction();
        else field.formControl.setValue(true);
      });
  }

  private conformityExists(
    ctrl: FormControl,
    specKey: string,
    passKey: string
  ) {
    return ctrl.value?.some(
      (row) => row.specification?.key === specKey && row.pass?.key === passKey
    );
  }

  private addConformanceEntry(
    model,
    specificationKey: string,
    passKey: string
  ) {
    const publicationDate = this.codelistQuery.getCodelistEntryByKey(
      "6005",
      specificationKey
    )?.data;
    const conformanceValues = (model.conformanceResult ?? []).filter(
      (item) => item.specification?.key !== specificationKey
    );
    conformanceValues.push({
      specification: {
        key: specificationKey,
      },
      pass: {
        key: passKey,
      },
      publicationDate:
        publicationDate?.length > 0 ? new Date(publicationDate) : null,
      isInspire: true,
    });
    model.conformanceResult = conformanceValues;
  }

  private handleIsInspireConformClick(field) {
    const cookieId = "HIDE_INSPIRE_CONFORM_INFO";
    const isConform = field.formControl.value;

    const executeAction = () => {
      if (isConform) {
        this.addConformanceEntry(field.model, "12", "1");
      } else {
        this.addConformanceEntry(field.model, "12", "2");
      }
      field.options.formState.updateModel();
    };

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return;
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: this.inspireChangeMessage,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .subscribe((decision) => {
        if (decision === "ok") executeAction();
        else field.formControl.setValue(!isConform);
      });
  }

  /**
   * Empty adv-product list when adv checkbox was deselected
   */
  private handleAdvClick(field) {
    const isChecked = field.formControl.value;
    const advProductGroups = field.model.advProductGroups;
    if (isChecked || !advProductGroups || advProductGroups.length === 0) return;

    field.model.advProductGroups = [];
    field.options.formState.updateModel();
    this.snack.open("Die AdV-Produktgruppe wurde automatisch geleert");
  }
}
