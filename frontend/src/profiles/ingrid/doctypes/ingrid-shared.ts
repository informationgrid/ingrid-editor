import { BaseDoctype } from "../../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
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
import { ConfigService } from "../../../app/services/config/config.service";

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
  dialog = inject(MatDialog);
  cookieService = inject(CookieService);
  private snack = inject(MatSnackBar);
  protected configService = inject(ConfigService);

  private inspireChangeMessage =
    "ACHTUNG: Grad der Konformität zur INSPIRE-Spezifikation im Bereich 'Zusatzinformationen' wird geändert.";
  private inspireDeleteMessage =
    "ACHTUNG: Der Eintrag in Konformität zur INSPIRE-Spezifikation im Bereich 'Zusatzinformationen' wird gelöscht.";

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
          this.addInput(
            "parentIdentifier",
            "Identifikator des übergeordneten Metadatensatzes",
            {
              wrappers: ["panel", "form-field"],
              className: "optional",
            }
          ),
          this.addInput("alternateTitle", "Kurzbezeichnung", {
            wrappers: ["panel", "form-field"],
            className: "optional",
          }),
          this.addTextArea("description", "Beschreibung", this.id, {
            required: true,
            rows: 6,
          }),
          this.addPreviewImage("graphicOverviews", "Vorschaugrafik", {
            className: "optional",
          }),
          this.addAddressCard("pointOfContact", "Adressen", {
            required: true,
            validators: {
              atLeastOneMD: {
                expression: (ctrl) =>
                  // equals Ansprechpartner MD
                  ctrl.value
                    ? ctrl.value.some((address) => address.type?.key === "12")
                    : false,
                message: "Es muss mindestens einen Ansprechpartner MD geben.",
              },
            },
          }),
        ]),
      ].filter(Boolean)
    );
  }

  private handleActivateOpenData(field) {
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

    const message =
      "Wird dieses Auswahl gewählt, so:" +
      ' <ul><li>werden alle Zugriffsbeschränkungen entfernt</li>  <li>wird die Angabe einer Opendata-Kategorie unter "Verschlagwortung" verpflichtend</li><li>wird dem Datensatz beim Export in ISO19139 Format automatisch das Schlagwort "opendata" hinzugefügt</li></ul> ';
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

  private handleDeactivateOpenData(field) {
    const cookieId = "HIDE_OPEN_DATA_INFO";
    if (this.cookieService.getCookie(cookieId) === "true") {
      field.options.formState.updateModel();
    }
    const message =
      'Wird dieses Auswahl gewählt, so wird die Opendata-Kategorie unter "Verschlagwortung" entfernt.';
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
        if (decision != "ok") field.formControl.setValue(true);
        return;
      });
  }

  private handleOpenDataClick(field) {
    const isChecked = field.formControl.value;
    if (!isChecked) {
      this.handleDeactivateOpenData(field);
    } else {
      this.handleActivateOpenData(field);
    }
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
                hide: "!formState.mainModel?.isInspireIdentified",
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
                className: "optional",
                options: this.getPriorityDatasets(),
                codelistId: 6350,
                expressions: {
                  hide: "!formState.mainModel?.isInspireIdentified",
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
                  className: "field.props.required ? '' : 'optional'",
                  hide: "!formState.mainModel?.isInspireIdentified",
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
        this.addGroupSimple("keywords", [
          this.addRepeatList("gemet", "Gemet Schlagworte", {
            view: "chip",
            className: "optional",
            placeholder: "Im Gemet suchen",
            restCall: (query: string) =>
              this.http.get<any[]>(
                `${ConfigService.backendApiUrl}keywords/gemet?q=${query}`
              ),
            labelField: "label",
            selectLabelField: (item) => {
              return item.alternativeLabel
                ? `${item.label} (${item.alternativeLabel})`
                : item.label;
            },
          }),
          this.addRepeatList("umthes", "Umthes Schlagworte", {
            view: "chip",
            className: "optional",
            placeholder: "Im Umweltthesaurus suchen",
            restCall: (query: string) =>
              this.http.get<any[]>(
                `${ConfigService.backendApiUrl}keywords/umthes?q=${query}`
              ),
            labelField: "label",
            selectLabelField: (item) => {
              return item.alternativeLabel
                ? `${item.label} (${item.alternativeLabel})`
                : item.label;
            },
          }),
          this.addRepeatList("free", "Freie Schlagworte", {
            view: "chip",
            className: "optional",
            hint: this.keywordFieldHint,
            convert: (val) => (val ? { label: val } : null),
            labelField: "label",
          }),
        ]),
        this.addInput(null, "Schlagwortanalyse", {
          className: "optional",
          wrappers: ["panel", "button", "form-field"],
          placeholder: this.transloco.translate("form.placeholder.enter"),
          hintStart: "Mehrere Schlagworte durch Komma trennen",
          hideInPreview: true,
          buttonConfig: {
            text: "Analysieren",
            onClick: async (buttonConfig, field) => {
              await this.analyzeKeywords(field, options);
            },
          },
          validators: {
            mustBeEmptyBeforeSave: {
              expression: (ctrl) => {
                return (
                  ctrl.value === null ||
                  ctrl.value === undefined ||
                  ctrl.value === ""
                );
              },
              message: "Der Inhalt muss noch mit 'Return' bestätigt werden",
            },
          },
        }),
      ].filter(Boolean)
    );
  }

  private async analyzeKeywords(
    field: FormlyFieldConfig,
    options: KeywordSectionOptions
  ) {
    const value = field.formControl.value;
    if (!value) return;

    field.formControl.setValue("Schlagworte werden analysiert ...");
    field.formControl.disable();
    this.snack.dismiss();
    const formState = field.options.formState;
    const res = await Promise.all(
      value
        .split(",")
        .map((item) => item.trim())
        .map(async (item) => await this.assignKeyword(formState, item, options))
    );

    field.options.formState.updateModel();
    field.formControl.enable();
    field.formControl.setValue("");
    this.informUserAboutThesaurusAnalysis(res);
  }

  private async assignKeyword(formState, item, options: KeywordSectionOptions) {
    if (options.inspireTopics && formState.mainModel.isInspireIdentified) {
      const resultTheme = this.checkInThemes(formState, item, options);
      if (resultTheme.found) return resultTheme;
    }

    const gemetResult = await this.checkInThesaurus(
      this.http,
      formState.mainModel,
      item,
      "gemet"
    );
    if (gemetResult.found) return gemetResult;

    const umthesResult = await this.checkInThesaurus(
      this.http,
      formState.mainModel,
      item,
      "umthes"
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

  private async checkInThesaurus(
    http: HttpClient,
    model,
    item,
    thesaurus: string
  ): Promise<ThesaurusResult> {
    const response = await http
      .get<any[]>(
        `${ConfigService.backendApiUrl}keywords/${thesaurus}?q=${encodeURI(
          item
        )}&type=EXACT`
      )
      .toPromise();
    const thesaurusName =
      thesaurus === "gemet" ? "Gemet Schlagworte" : "Umthes Schlagworte";
    if (response.length > 0) {
      const exists = model.keywords[thesaurus].some(
        (item) => item.label === response[0].label
      );
      if (!exists) model.keywords[thesaurus].push(response[0]);
      return {
        thesaurus: thesaurusName,
        found: true,
        alreadyExists: exists,
        value: response[0].label,
      };
    }
    return { thesaurus: thesaurusName, found: false, value: item };
  }

  addSpatialSection() {
    const defaultSpatial =
      this.configService.$userInfo.value.currentCatalog.settings.config
        ?.spatialReference;
    return this.addSection("Raumbezug", [
      this.addGroupSimple(
        "spatial",
        [
          this.addSpatial("references", "Raumbezug", {
            required: true,
            hasInlineContextHelp: true,
            defaultValue: defaultSpatial ? defaultSpatial : undefined,
          }),
          this.addRepeatList("spatialSystems", "Raumbezugssysteme", {
            asSelect: false,
            showSearch: true,
            options: this.getCodelistForSelect(100, "spatialSystems"),
            codelistId: 100,
            expressions: {
              "props.required":
                "formState.mainModel?._type === 'InGridGeoDataset' || formState.mainModel?._type === 'InGridGeoService'",
            },
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
                {
                  label: "bis: gegenwärtige Aktualität unklar",
                  value: "unknown",
                },
                { label: "bis: gegenwärtig aktuell", value: "requestTime" },
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
          "Intervall der Erhebung",
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
          contextHelpId: "maintenanceNote",
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
          this.addSelect("language", "Sprache des Metadatensatzes", {
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
            contextHelpId: "languageInfo",
          }),
        ]),
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
        options.extraInfoCharSetData
          ? this.addGroupSimple("metadata", [
              this.addSelect("characterSet", "Zeichensatz des Datensatzes", {
                showSearch: true,
                options: this.getCodelistForSelect(510, "characterSet"),
                codelistId: 510,
                className: "optional",
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
                      !model.isInspireIdentified ||
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
            "Weitere rechtliche Grundlagen",
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
            "props.minLength": "field.props.required ? 1 : undefined",
            defaultValue: "field.props.required ? [{}] : null",
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
                required: true,
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
      this.addRepeatDetailList("references", "Verweise", {
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
          className: "flex-1 right-align",
          wrappers: ["form-field", "addons"],
          suffix: {
            text: "m",
          },
        }),
        this.addInputInline("distanceDPI", "Scanauflösung", {
          type: "number",
          min: 0,
          className: "flex-1 right-align",
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
      this.addAutoCompleteInline("type", "Typ", {
        required: true,
        options: this.getCodelistForSelect(2000, "type").pipe(
          map((data) => {
            const mappedDoctype = this.mapDocumentTypeToClass(this.id);
            return data.filter((item) => {
              return (
                this.codelistQuery
                  .getCodelistEntryByKey("2000", item.value)
                  .data?.split(",")
                  ?.indexOf(mappedDoctype) !== -1
              );
            });
          })
        ),
        codelistId: 2000,
        wrappers: ["inline-help", "form-field"],
        hasInlineContextHelp: true,
      }),
      this.addInputInline("title", "Titel", {
        required: true,
        wrappers: ["inline-help", "form-field"],
        hasInlineContextHelp: true,
      }),
      this.addInputInline("url", "URL", {
        wrappers: ["inline-help", "form-field"],
        hasInlineContextHelp: true,
        updateOn: "change",
        validators: {
          validation: ["url"],
        },
        expressions: {
          "props.required": (field) => {
            return !field.form.value?.uuidRef;
          },
        },
        validation: {
          messages: {
            required: "URL oder Datensatzverweis muss ausgefüllt sein",
          },
        },
      }),
      this.addInputInline("uuidRef", "Datensatzverweis", {
        wrappers: ["inline-help", "form-field"],
        hasInlineContextHelp: true,
        updateOn: "change",
        expressions: {
          "props.required": (field) => {
            return !field.form.value?.url;
          },
        },
        validation: {
          messages: {
            required: "URL oder Datensatzverweis muss ausgefüllt sein",
          },
        },
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

    const message = this.inspireChangeMessage;

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

    const message = this.inspireDeleteMessage;

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
    return this.codelistService.observeRaw("6350").pipe(
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
    options: KeywordSectionOptions
  ): ThesaurusResult {
    const id = this.codelistQuery.getCodelistEntryIdByValue("6100", item, "de");
    if (id) {
      const exists = formState.mainModel.themes.some(
        (entry) => entry.key === id
      );
      if (!exists) {
        const itemTheme = { key: id };
        formState.mainModel.themes.push(itemTheme);
        if (options.thesaurusTopics) {
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
    const exists = model.keywords.free.some((entry) => entry === item);
    if (!exists) model.keywords.free.push({ label: item });
    return {
      found: true,
      value: item,
      thesaurus: "Freie Schlagworte",
      alreadyExists: exists,
    };
  }

  private mapDocumentTypeToClass(id: string) {
    switch (id) {
      case "InGridSpecialisedTask":
        return "0";
      case "InGridGeoDataset":
        return "1";
      case "InGridLiterature":
        return "2";
      case "InGridGeoService":
        return "3";
      case "InGridProject":
        return "4";
      case "InGridDataCollection":
        return "5";
      case "InGridInformationSystem":
        return "6";
    }
  }
}
