import { BaseDoctype } from "../../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { ConformityDialogComponent } from "../dialogs/conformity-dialog.component";
import { isNotEmptyObject } from "../../../app/shared/utils";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../app/dialogs/confirm/confirm-dialog.component";
import { CookieService } from "../../../app/services/cookie.service";
import { FormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CodelistEntry } from "../../../app/store/codelist/codelist.model";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { ThesaurusReportComponent } from "../components/thesaurus-report.component";
import { ThesaurusResult } from "../components/thesaurus-result";

interface GeneralSectionOptions {
  additionalGroup?: FormlyFieldConfig;
  inspireRelevant?: boolean;
  openData?: boolean;
  advCompatible?: boolean;
}

interface KeywordSectionOptions {
  priorityDataset?: boolean;
  spatialScope?: boolean;
  thesaurusTopics?: boolean;
  inspireTopics?: boolean;
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
  private keywordFieldHint =
    "Eingabe mit RETURN bestätigen, mehrere Schlagworte durch Komma trennen";
  http = inject(HttpClient);

  private inspireChangeMessage =
    "ACHTUNG: Grad der Konformität zur INSPIRE-Spezifikation im Bereich 'Zusatzinformationen' wird geändert.";
  private inspireDeleteMessage =
    "ACHTUNG: Der Eintrag in Konformität zur INSPIRE-Spezifikation im Bereich 'Zusatzinformationen' wird gelöscht.";
  private openDataMessage =
    "<br><br>Wird diese Auswahl gewählt, so werden alle Zugriffsbeschränkungen entfernt. Möchten Sie fortfahren?";

  private inspireToIsoMapping = {
    "101": "13",
    "103": "13",
    "104": "3",
    "105": "13",
    "106": "15",
    "107": "18",
    "108": "12",
    "109": "7",
    "201": "6",
    "202": "10",
    "203": "10",
    "204": "8",
    "301": "3",
    "302": "17",
    "303": "8",
    "304": "15",
    "305": "9",
    "306": "19",
    "307": "17",
    "308": "17",
    "309": "1",
    "310": "16",
    "311": "15",
    "312": "8",
    "313": "4",
    "315": "14",
    "316": "14",
    "317": "2",
    "318": "2",
    "319": "2",
    "320": "5",
    "321": "5",
  };

  protected constructor(
    private codelistServiceIngrid: CodelistService,
    codelistQuery: CodelistQuery,
    private uploadService: UploadService,
    private dialog: MatDialog,
    private cookieService: CookieService,
    private snack: MatSnackBar
  ) {
    super(codelistServiceIngrid, codelistQuery);
  }

  addGeneralSection(options: GeneralSectionOptions = {}): FormlyFieldConfig {
    return this.addGroupSimple(
      null,
      [
        options.inspireRelevant || options.advCompatible || options.openData
          ? this.addGroup(
              null,
              "Typ",
              [
                options.inspireRelevant
                  ? this.addCheckboxInline(
                      "isInspireIdentified",
                      "INSPIRE-relevant",
                      {
                        className: "flex-1",
                        click: (field) =>
                          this.handleInspireIdentifiedClick(field),
                      }
                    )
                  : null,
                options.advCompatible
                  ? this.addCheckboxInline(
                      "isAdVCompatible",
                      "AdV kompatibel",
                      {
                        className: "flex-1",
                        click: (field) => this.handleAdvClick(field),
                      }
                    )
                  : null,
                options.openData
                  ? this.addCheckboxInline("isOpenData", "Open Data", {
                      className: "flex-1",
                      click: (field) => this.handleOpenDataClick(field),
                    })
                  : null,
              ].filter(Boolean)
            )
          : null,
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
          view: "chip",
          asSelect: true,
          showSearch: true,
          options: this.getCodelistForSelect(8010, "advProductGroups"),
          codelistId: 8010,
          expressions: {
            "props.required": "formState.mainModel?.isAdVCompatible",
            className: "field.props.required ? '' : 'optional'",
          },
        }),
        options.inspireTopics
          ? this.addRepeatList("themes", "INSPIRE-Themen", {
              view: "chip",
              asSelect: true,
              showSearch: true,
              options: this.getCodelistForSelect(6100, "themes"),
              codelistId: 6100,
              expressions: {
                "props.required": "formState.mainModel?.isInspireIdentified",
                className: "field.props.required ? '' : 'optional'",
              },
              change: (field, $event) =>
                options.thesaurusTopics &&
                this.updateIsoCategory($event, field.options.formState),
              remove: (field, $event) =>
                options.thesaurusTopics &&
                this.updateIsoCategory($event, field.options.formState, true),
            })
          : null,
        this.addRepeatList("openDataCategories", "OpenData - Kategorien", {
          view: "chip",
          asSelect: true,
          showSearch: true,
          required: true,
          options: this.getCodelistForSelect(6400, "openDataCategories"),
          codelistId: 6400,
          expressions: { hide: "!formState.mainModel?.isOpenData" },
        }),
        options.priorityDataset
          ? this.addRepeatList(
              "priorityDatasets",
              "INSPIRE - priority data set",
              {
                view: "chip",
                asSelect: true,
                showSearch: true,
                options: this.getPriorityDatasets(),
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
              view: "chip",
              asSelect: true,
              showSearch: true,
              options: this.getCodelistForSelect(527, "topicCategories"),
              codelistId: 527,
              required: true,
              remove: (field, event) =>
                this.checkConnectedIsoCategory(event, field),
            })
          : null,
        this.addRepeatList("keywordsUmthes", "Umthes Schlagworte", {
          view: "chip",
          placeholder: "Im Umweltthesaurus suchen",
          restCall: (query: string) =>
            this.http.get<any[]>(`/api/keywords/umthes?q=${query}`),
          labelField: "label",
          selectLabelField: (item) => {
            return item.alternativeLabel
              ? `${item.label} (${item.alternativeLabel})`
              : item.label;
          },
        }),
        this.addRepeatList("keywords", "Optionale Schlagworte", {
          view: "chip",
          hint: this.keywordFieldHint,
        }),
        this.addInput(null, null, {
          wrappers: ["panel", "form-field"],
          fieldLabel: "Analyse",
          updateOn: "change",
          hintStart: this.keywordFieldHint,
          keydown: async (field, event: KeyboardEvent) => {
            await this.analyzeKeywords(event, field, options.thesaurusTopics);
          },
        }),
      ].filter(Boolean)
    );
  }

  private async analyzeKeywords(
    event: KeyboardEvent,
    field: FormlyFieldConfig,
    thesaurusTopicsEnabled: boolean
  ) {
    if (event.key !== "Enter") return;

    const value = field.formControl.value;
    if (!value) return;

    field.props.hintStart = "Schlagworte werden analysiert ...";
    field.formControl.disable();
    this.snack.dismiss();
    const formState = field.options.formState;
    const res = await Promise.all(
      value
        .split(",")
        .map((item) => item.trim())
        .map(
          async (item) =>
            await this.assignKeyword(formState, item, thesaurusTopicsEnabled)
        )
    );

    field.options.formState.updateModel();
    field.formControl.enable();
    field.formControl.setValue("");
    this.informUserAboutThesaurusAnalysis(res);
    field.props.hintStart = this.keywordFieldHint;
  }

  private async assignKeyword(formState, item, withThesaurusTopics: boolean) {
    const resultTheme = this.checkInThemes(
      formState,
      item,
      withThesaurusTopics
    );
    if (resultTheme.found) return resultTheme;
    const umthesResult = await this.checkInUmthes(
      this.http,
      formState.mainModel,
      item
    );
    if (umthesResult.found) return umthesResult;
    else return this.addFreeKeyword(formState.mainModel, item);
  }

  private informUserAboutThesaurusAnalysis(res: Awaited<ThesaurusResult>[]) {
    this.snack.openFromComponent(ThesaurusReportComponent, {
      duration: 20000,
      data: res,
    });
  }

  private checkConnectedIsoCategory(event, field) {
    const possibleKeys = Object.keys(this.inspireToIsoMapping).filter(
      (key) => this.inspireToIsoMapping[key] === event.key
    );
    const themes = field.options.formState.mainModel.themes;
    const connectedInspireTheme = themes.find(
      (item) => possibleKeys.indexOf(item.key) !== -1
    );
    if (connectedInspireTheme) {
      field.model.push(event);
      field.options.formState.updateModel();
      const inspireThemeValue = this.codelistQuery.getCodelistEntryValueByKey(
        "6100",
        connectedInspireTheme.key
      );
      this.snack.open(
        `Die Kategorie muss bestehen bleiben, solange das INSPIRE-Thema '${inspireThemeValue}' verwendet wird.`
      );
    }
  }

  private updateIsoCategory(item, formstate, doRemove: boolean = false) {
    const isoKey = this.inspireToIsoMapping[item.key];
    if (!isoKey) return;

    // check if exists and add if not
    const topics = formstate.mainModel.topicCategories;
    const alreadyExists = topics.some((item) => item.key === isoKey);
    const isoValue = this.codelistQuery.getCodelistEntryValueByKey(
      "527",
      isoKey
    );

    if (!doRemove && !alreadyExists) {
      topics.push({ key: isoKey });
      formstate.updateModel();
      this.snack.open(
        `Die abhängige ISO-Kategorie '${isoValue}' wurde ebenfalls hinzugefügt.`
      );
    } else if (doRemove && alreadyExists) {
      formstate.mainModel.topicCategories = topics.filter(
        (item) => item.key !== isoKey
      );
      formstate.updateModel();
      this.snack.open(
        `Die abhängige ISO-Kategorie '${isoValue}' wurde ebenfalls entfernt.`
      );
    }
  }

  private async checkInUmthes(
    http: HttpClient,
    model,
    item
  ): Promise<ThesaurusResult> {
    const response = await http
      .get<any[]>(`/api/keywords/umthes?q=${encodeURI(item)}&type=EXACT`)
      .toPromise();
    if (response.length > 0) {
      const exists = model.keywordsUmthes.some(
        (item) => item.label === response[0].label
      );
      if (!exists) model.keywordsUmthes.push(response[0]);
      return {
        thesaurus: "Umthes Schlagworte",
        found: true,
        alreadyExists: exists,
        value: response[0].label,
      };
    }
    return { thesaurus: "Umthes Schlagworte", found: false, value: item };
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
            ? this.addInput("regionKey", "Amtlicher Regionalschlüssel", {
                className: "optional flex-1",
                wrappers: ["panel", "form-field"],
              })
            : null,
          this.addRepeatList("spatialSystems", "Raumbezugssysteme", {
            asSelect: false,
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
                        isNotEmptyObject(field.form.value),
                    },
                  }),
                  this.addInputInline("maximumValue", "Maximum", {
                    type: "number",
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                    expressions: {
                      "props.required": (field) =>
                        isNotEmptyObject(field.form.value),
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
                        isNotEmptyObject(field.form.value),
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
                        isNotEmptyObject(field.form.value),
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
              expressions: {
                className: (field) =>
                  isNotEmptyObject(field.form.value?.verticalExtent)
                    ? ""
                    : "optional",
              },
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
        this.addRepeat("events", "Zeitbezug der Ressource", {
          required: true,
          fields: [
            this.addDatepicker("referenceDate", null, {
              fieldLabel: "Datum",
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
              wrappers: ["form-field"],
              options: [
                { label: "am", value: "at" },
                { label: "bis", value: "till" },
                { label: "von", value: "since" },
              ],
            }),
            this.addSelect("resourceDateTypeSince", null, {
              showSearch: true,
              wrappers: ["form-field"],
              options: [
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
                "props.required": (field) => isNotEmptyObject(field.form.value),
              },
            }),
            this.addSelectInline("unit", "Einheit", {
              showSearch: true,
              options: this.getCodelistForSelect(1230, "timeRefStatus"),
              codelistId: 1230,
              className: "flex-3",
              allowNoValue: true,
              expressions: {
                "props.required": (field) => isNotEmptyObject(field.form.value),
              },
            }),
          ],
          {
            expressions: {
              className: (field) =>
                isNotEmptyObject(field.form.value) ? "" : "optional",
            },
          }
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
                defaultValue: {
                  key: "150",
                },
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
          options: this.getCodelistForSelect(3571, "extraInfoPublishArea").pipe(
            // sort by ID, which defines hierarchy
            map((items) => items.sort((a, b) => a.value.localeCompare(b.value)))
          ),
          codelistId: 3571,
          required: true,
          defaultValue: {
            key: "1",
          },
        }),
        options.extraInfoLangData
          ? this.addGroupSimple("dataset", [
              this.addRepeatList("languages", "Sprache der Ressource", {
                view: "chip",
                asSelect: true,
                asSimpleValues: true,
                options: this.getCodelistForSelect(
                  99999999,
                  "extraInfoLangData"
                ),
                codelistId: 99999999,
                required: true,
                defaultValue: ["150"],
                expressions: {
                  "props.required":
                    "['InGridGeoDataset', 'InGridLiterature', 'InGridDataCollection'].indexOf(formState.mainModel?._type) !== -1",
                  className: "field.props.required ? '' : 'optional'",
                },
              }),
            ])
          : null,
        options.conformity
          ? this.addTable("conformanceResult", "Konformität", {
              supportUpload: false,
              expressions: {
                "props.required": "formState.mainModel?.isInspireIdentified",
                className: "field.props.required ? '' : 'optional'",
              },
              dialog: ConformityDialogComponent,
              columns: [
                {
                  key: "specification",
                  type: "select",
                  label: "Spezifikation",
                  props: {
                    required: true,
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
                    required: true,
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
                  width: "110px",
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
          expressions: {
            "props.required": "formState.mainModel?.isInspireIdentified",
            className: "field.props.required ? '' : 'optional'",
          },
        }),
        this.addRepeat("useConstraints", "Nutzungsbedingungen", {
          expressions: {
            "props.required":
              "formState.mainModel?._type === 'InGridGeoDataset' || formState.mainModel?._type === 'InGridGeoService'",
            className: "field.props.required ? '' : 'optional'",
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
      this.addGroupSimple(
        "distribution",
        [
          this.addRepeat("format", "Datenformat", {
            expressions: {
              "props.required":
                "formState.mainModel?._type === 'InGridGeoDataset' && formState.mainModel?.isInspireIdentified",
              className: "field.props.required ? '' : 'optional'",
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
            validators: {
              validation: ["notEmptyArray"],
            },
          }),
        ],
        {
          hideExpression: `formState.mainModel?._type === 'InGridSpecialisedTask'`,
        }
      ),
      this.addRepeat("digitalTransferOptions", "Medienoption", {
        className: "optional",
        fields: [
          this.addSelectInline("name", "Medium", {
            showSearch: true,
            options: this.getCodelistForSelect(520, "specification"),
            codelistId: 520,
          }),
          this.addInputInline("transferSize", "Datenvolumen", {
            type: "number",
            className: "right-align",
            wrappers: ["form-field", "addons"],
            suffix: {
              text: "MB",
            },
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
        fieldGroupClassName: "flex-col",
        fields: [this.urlRefFields()],
        className: "optional",
        hasExtendedGap: true,
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

  addResolutionFields(): FormlyFieldConfig {
    return this.addRepeat("resolution", "Erstellungsmaßstab", {
      className: "optional",
      fields: [
        this.addInputInline("denominator", "Maßstab 1:x", {
          type: "number",
          min: 0,
        }),
        this.addInputInline("distanceMeter", "Bodenauflösung", {
          type: "number",
          min: 0,
          className: "right-align",
          wrappers: ["form-field", "addons"],
          suffix: {
            text: "m",
          },
        }),
        this.addInputInline("distanceDPI", "Scanauflösung", {
          type: "number",
          min: 0,
          className: "right-align",
          wrappers: ["form-field", "addons"],
          suffix: {
            text: "DPI",
          },
        }),
      ],
    });
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
        { fieldGroupClassName: "flex-row" }
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
      this.addAutoCompleteInline("title", "Titel", {
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

  private getPriorityDatasets(): Observable<SelectOptionUi[]> {
    return this.codelistServiceIngrid.observeRaw("6350").pipe(
      map((codelist) => {
        return CodelistService.mapToSelect(codelist, "de", false)
          .map((item, index) =>
            this.adaptPriorityDatasetItem(item, codelist.entries[index])
          )
          .sort((a, b) => {
            // put INVALID items to the end of the list
            if (a.label.indexOf("INVALID -") === 0) return 1;
            if (b.label.indexOf("INVALID -") === 0) return -1;
            return a.label?.localeCompare(b.label);
          });
      })
    );
  }

  private adaptPriorityDatasetItem(item: SelectOptionUi, entry: CodelistEntry) {
    item.label += " {en: " + entry.fields["en"] + "}";
    const parsedData = JSON.parse(entry.data);
    const isValid =
      parsedData?.status === undefined || parsedData?.status === "VALID";
    if (!isValid) {
      item.label = "INVALID - " + item.label;
      item.disabled = true;
    }
    return item;
  }

  private checkInThemes(
    formState: any,
    item: string,
    withThesaurusTopics: boolean
  ): ThesaurusResult {
    const id = this.codelistQuery.getCodelistEntryIdByValue("6100", item, "de");
    if (id) {
      const exists = formState.mainModel.themes.some(
        (entry) => entry.key === id
      );
      if (!exists) {
        const itemTheme = { key: id };
        formState.mainModel.themes.push(itemTheme);
        if (withThesaurusTopics) {
          this.updateIsoCategory(itemTheme, formState);
        }
      }
      return {
        thesaurus: "INSPIRE-Themen",
        found: true,
        alreadyExists: exists,
        value: item,
      };
    }
    return { thesaurus: "INSPIRE-Themen", found: false, value: item };
  }

  private addFreeKeyword(model, item: string): ThesaurusResult {
    const exists = model.keywords.some((entry) => entry === item);
    if (!exists) model.keywords.push(item);
    return {
      found: true,
      value: item,
      thesaurus: "Optionale Schlagworte",
      alreadyExists: exists,
    };
  }
}
