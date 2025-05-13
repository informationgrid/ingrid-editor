/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { BaseDoctype } from "../../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import {
  CodelistService,
  SelectOption,
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
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { CodelistEntry } from "../../../app/store/codelist/codelist.model";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { ThesaurusReportComponent } from "../components/thesaurus-report.component";
import { ThesaurusResult } from "../components/thesaurus-result";
import { ConfigService } from "../../../app/services/config/config.service";
import { BehaviourService } from "../../../app/services/behavior/behaviour.service";
import { KeywordAnalysis, KeywordSectionOptions } from "../utils/keywords";
import {
  MetadataOption,
  MetadataOptionItems,
  MetadataProps,
} from "../../../app/formly/types/metadata-type/metadata-type.component";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { IgeError } from "../../../app/models/ige-error";
import { CodelistStore } from "../../../app/store/codelist/codelist.store";
import { ReferenceViewComponent } from "../components/reference-view/reference-view.component";
import { DocumentService } from "../../../app/services/document/document.service";

interface GeneralSectionOptions {
  thesaurusTopics?: boolean;
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
  private behaviourService = inject(BehaviourService);
  documentService = inject(DocumentService);
  private keywordAnalysis = inject(KeywordAnalysis);
  private uploadService = inject(UploadService);

  protected codelistStore = inject(CodelistStore);
  protected codelistService = inject(CodelistService);

  options = {
    dynamicRequired: {
      accessConstraints: (field: FormlyFieldConfig) =>
        field.options.formState.mainModel?.properties?.isInspireIdentified !==
        undefined,
      openDataCategories: (field: FormlyFieldConfig) => true,
      spatialReferences: (field: FormlyFieldConfig) => true,
      spatialSystems: (field: FormlyFieldConfig) => false,
      dataFormat: (field: FormlyFieldConfig) => false,
      spatialScope: (field: FormlyFieldConfig) => false,
    },
    dynamicHide: {
      openDataCategories: (field: FormlyFieldConfig) =>
        !field.options.formState.mainModel?.properties?.isOpenData,
    },
    required: {
      freeKeywords: false,
      useLimitation: false,
      topicCategories: true,
      resourceDateType: false,
      extraInfoLangData: false,
      useConstraints: false,
    },
    hide: {
      openData: false,
    },
  };

  private inspireChangeMessage =
    "ACHTUNG: Grad der Konformität zur INSPIRE-Spezifikation im Bereich 'Zusatzinformationen' wird geändert.";
  private inspireDeleteMessage =
    "ACHTUNG: Der Eintrag in Konformität zur INSPIRE-Spezifikation im Bereich 'Zusatzinformationen' wird gelöscht.";

  showInVeKoSField: boolean = false;
  showInspireRelevant: boolean = false;
  showInspireConform: boolean = false;
  showHVD: boolean = false;
  showAdVCompatible: boolean = false;
  showAdVProductGroup: boolean = false;
  showDoiFields: boolean = false;
  /** @deprecated: should be defined in geoservice-doctype */
  isGeoService: boolean = false;
  /** @deprecated: should be defined in geodataset-doctype */
  isGeoDataset: boolean = false;
  private thesaurusTopics: boolean = false;

  codelistIds = {
    distributionFormat: "1320",
    urlDataType: "1320",
    fileReferenceFormat: "1320",
  };

  protected metadataOptions(): MetadataOption[] {
    return [
      this.showInspireRelevant
        ? <MetadataOption>{
            label: "INSPIRE-relevant",
            contextHelpKey: "isInspireIdentified",
            typeOptions: [
              {
                multiple: false,
                key: "isInspireIdentified",
                onChange: (field: FormlyFieldConfig, value: any) => {
                  field.props.availableOptions[1].typeOptions[1].hidden =
                    value === undefined;
                },
                items: this.showInspireConform
                  ? [
                      {
                        label: "INSPIRE konform",
                        value: "conform",
                        onClick: (
                          field: FormlyFieldConfig,
                          previousValue: any,
                        ) =>
                          this.handleIsInspireConformClick(
                            field,
                            previousValue,
                          ).subscribe(),
                      },
                      {
                        label: "INSPIRE nicht konform",
                        value: "notConform",
                        onClick: (
                          field: FormlyFieldConfig,
                          previousValue: any,
                        ) =>
                          this.handleIsInspireConformClick(
                            field,
                            previousValue,
                          ).subscribe(),
                      },
                    ]
                  : [
                      {
                        label: "INSPIRE",
                        value: "relevant",
                        onClick: (field: FormlyFieldConfig) =>
                          field.formControl.value.isInspireIdentified ===
                          "relevant"
                            ? this.handleActivateInspireIdentifiedFromGeoservice(
                                field,
                              ).subscribe()
                            : this.handleDeactivateInspireIdentifiedFromGeoservice(
                                field,
                              ).subscribe(),
                      },
                    ],
              },
              this.showInVeKoSField
                ? <MetadataOptionItems>{
                    multiple: false,
                    key: "invekos",
                    items: [
                      {
                        label: "InVeKoS/IACS (GSAA)",
                        value: { key: "gsaa" },
                        contextHelpKey: "invekos",
                        onClick: (field) =>
                          this.handleInVeKosChange(field, this.thesaurusTopics),
                      },
                      {
                        label: "InVeKoS/IACS (LPIS)",
                        value: { key: "lpis" },
                        contextHelpKey: "invekos",
                        onClick: (field) =>
                          this.handleInVeKosChange(field, this.thesaurusTopics),
                      },
                    ],
                  }
                : null,
            ].filter(Boolean),
          }
        : null,
      this.options.hide.openData
        ? null
        : {
            label: "Open Data",
            typeOptions: [
              <MetadataOptionItems>{
                multiple: true,
                items: [
                  {
                    label: "Offene Lizenz",
                    key: "isOpenData",
                    value: true,
                    contextHelpKey: "isOpenData",
                    onClick: (field: FormlyFieldConfig) =>
                      this.handleOpenDataClick(field),
                  },
                  this.showHVD
                    ? {
                        label: "High-Value-Dataset",
                        key: "isHvd",
                        value: true,
                        contextHelpKey: "isHvd",
                        onClick: (field: FormlyFieldConfig) =>
                          this.handleHVDClick(field).subscribe(),
                      }
                    : null,
                ].filter(Boolean),
              },
            ],
          },
      this.showAdVCompatible
        ? {
            label: "AdV",
            typeOptions: [
              {
                multiple: true,
                items: [
                  {
                    label: "kompatibel",
                    completeLabel: "AdV kompatibel",
                    key: "isAdVCompatible",
                    value: true,
                    contextHelpKey: "isAdVCompatible",
                    onClick: (field: FormlyFieldConfig) =>
                      this.handleAdvClick(field),
                  },
                ],
              },
            ],
          }
        : null,
    ].filter(Boolean);
  }

  addGeneralSection(options: GeneralSectionOptions = {}): FormlyFieldConfig {
    this.thesaurusTopics = options.thesaurusTopics;
    const availableOptions = this.metadataOptions();
    return this.addGroupSimple(
      null,
      [
        availableOptions.length > 0
          ? this.addSection("Merkmale", [
              <FormlyFieldConfig>{
                key: "properties",
                type: "metadata",

                props: <MetadataProps>{
                  availableOptions: availableOptions,
                  disabledOptions: {},
                  change: (field, previousValue) => {
                    const data = field.formControl.value;
                    if (
                      !data.isInspireIdentified &&
                      previousValue?.isInspireIdentified !== undefined
                    ) {
                      field.formControl.setValue({
                        ...data,
                        invekos: undefined,
                      });
                    }
                    // hide options here, since we don't use real formly fields inside
                    // metadata-component, so we can't use hide-property
                    field.props?.availableOptions?.forEach((option: any) => {
                      const invekosField = option?.typeOptions?.find(
                        (typeOption: any) => typeOption.key === "invekos",
                      );
                      if (invekosField)
                        invekosField.hidden = !data.isInspireIdentified;
                    });
                  },
                },
              },
            ])
          : null,
        this.addSection("Allgemeines", [
          this.addInput(
            "parentIdentifier",
            "Identifikator des übergeordneten Metadatensatzes",
            {
              wrappers: ["panel", "form-field"],
              className: "optional",
            },
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
                expression: (ctrl: FormControl) =>
                  // equals "Ansprechpartner MD"
                  ctrl.value
                    ? ctrl.value.some(
                        (address: any) => address.type?.key === "12",
                      )
                    : false,
                message: "Es muss mindestens einen 'Ansprechpartner MD' geben.",
              },
              atLeastOnePointOfContactWhenAdV: {
                expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
                  // equals "Ansprechpartner"
                  !field.model.properties?.isAdVCompatible ||
                  (ctrl.value
                    ? ctrl.value.some(
                        (address: any) => address.type?.key === "7",
                      )
                    : false),
                message: "Es muss mindestens einen 'Ansprechpartner' geben.",
              },
              atLeastOneOtherAddress: {
                expression: (ctrl: FormControl) =>
                  // not equals "Ansprechpartner MD"
                  ctrl.value
                    ? ctrl.value.some(
                        (address: any) => address.type?.key !== "12",
                      )
                    : false,
                message:
                  "Neben dem 'Ansprechpartner MD' muss mindestens eine weitere Adresse angegeben werden.",
              },
            },
          }),
        ]),
      ].filter(Boolean),
    );
  }

  handleActivateOpenData(field: FormlyFieldConfig): Observable<boolean> {
    const cookieId = "HIDE_OPEN_DATA_INFO";

    function executeAction() {
      const accessConstraintsControl = field.form.get(
        "resource.accessConstraints",
      );
      accessConstraintsControl?.setValue([{ key: "1" }]);
    }

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return of(true);
    }

    const message = `
      Wird diese Auswahl gewählt, so:
      <ul>
        <li>wird "Es gelten keine Zugriffsbeschränkungen" zu den Zugriffsbeschränkungen hinzugefügt</li>
        <li>wird die Angabe einer Opendata-Kategorie unter "Verschlagwortung" verpflichtend</li>
        <li>wird dem Datensatz beim Export in ISO19139 Format automatisch das Schlagwort "opendata" hinzugefügt</li>
      </ul>`;
    return this.showConfirmDialog(message, cookieId).pipe(
      map((decision) => {
        if (decision === "ok") {
          executeAction();
          return true;
        }
        field.formControl.setValue({
          ...field.formControl.value,
          isOpenData: false,
        });
        return false;
      }),
    );
  }

  handleDeactivateOpenData(field: FormlyFieldConfig): Observable<boolean> {
    const cookieId = "HIDE_OPEN_DATA_DEACTIVATE_INFO";
    if (this.cookieService.getCookie(cookieId) === "true") return of(true);

    const message =
      'Wird dieses Auswahl gewählt, so wird die Opendata-Kategorie unter "Verschlagwortung" entfernt.';
    return this.showConfirmDialog(message, cookieId).pipe(
      map((decision) => {
        const value = field.formControl.value;
        if (decision === "ok") {
          if (this.showHVD) {
            field.formControl.setValue({ ...value, isHvd: false });
          }
          return true;
        }
        field.formControl.setValue({ ...value, isOpenData: true });
        return false;
      }),
    );
  }

  private handleOpenDataClick(field: FormlyFieldConfig) {
    const isChecked = field.formControl.value.isOpenData;
    if (!isChecked) {
      this.handleDeactivateOpenData(field).subscribe();
    } else {
      this.handleActivateOpenData(field).subscribe();
    }
  }

  addKeywordsSection(options: KeywordSectionOptions = {}): FormlyFieldConfig {
    return this.addSection(
      "Verschlagwortung",
      [
        this.showAdVProductGroup
          ? this.addRepeatList("advProductGroups", "AdV-Produktgruppe", {
              view: "chip",
              asSelect: true,
              showSearch: true,
              options: this.getCodelistForSelect(
                "8010",
                "advProductGroups",
                "sortkey",
              ),
              codelistId: "8010",
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  field.options.formState.mainModel?.properties
                    ?.isAdVCompatible,
                className: (field: FormlyFieldConfig) =>
                  field.props.required ? "" : "optional",
              },
            })
          : null,
        this.showInVeKoSField
          ? this.addRepeatList("invekosKeywords", "InVeKoS-Schlagworte", {
              view: "chip",
              asSelect: true,
              showSearch: true,
              defaultValue: [],
              expressions: {
                hide: (field: FormlyFieldConfig) =>
                  !field.options.formState.mainModel?.properties
                    ?.isInspireIdentified,
              },
              options: [
                {
                  label: "GSAA",
                  value:
                    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/gsaa",
                },
                {
                  label: "Im Umweltinteresse genutzte Fläche",
                  value:
                    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/ecologicalFocusArea",
                },
                {
                  label: "InVeKoS",
                  value:
                    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/iacs",
                },
                {
                  label: "Landwirtschaftliche Fläche",
                  value:
                    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/agriculturalArea",
                },
                {
                  label: "LPIS",
                  value:
                    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/lpis",
                },
                {
                  label: "Referenzparzelle",
                  value:
                    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/referenceParcel",
                },
              ],
              validators: {
                invekos: {
                  expression: (ctrl: FormControl, field: FormlyFieldConfig) => {
                    const invekosValue =
                      field.options.formState.mainModel?.properties?.invekos
                        ?.key;
                    if (!invekosValue) return true;

                    const hasKeyword = (keyword: string) =>
                      ctrl.value?.some(
                        (item: any) =>
                          item.key ===
                          `http://inspire.ec.europa.eu/metadata-codelist/IACSData/${keyword}`,
                      );

                    if (invekosValue === "gsaa") {
                      return hasKeyword("iacs") && hasKeyword("gsaa");
                    } else if (invekosValue === "lpis") {
                      return hasKeyword("iacs") && hasKeyword("lpis");
                    } else {
                      return hasKeyword("iacs");
                    }
                  },
                  message: (_: any, field: FormlyFieldConfig) => {
                    const invekos =
                      field.formControl.root.value.properties?.invekos?.key;
                    let extraMessage = "";
                    if (invekos === "gsaa") extraMessage = "und 'GSAA'";
                    else if (invekos === "lpis") extraMessage = "und 'LPIS'";
                    return (
                      "Das Schlagwort 'InVeKoS'" +
                      extraMessage +
                      " ist verpflichtend"
                    );
                  },
                },
              },
            })
          : null,
        options.inspireTopics
          ? this.addRepeatList("themes", "INSPIRE-Themen", {
              view: "chip",
              asSelect: true,
              showSearch: true,
              options: this.getCodelistForSelect("6100", "themes"),
              codelistId: "6100",
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  field.options.formState.mainModel?.properties
                    ?.isInspireIdentified !== undefined,
                className: (field: FormlyFieldConfig) =>
                  field.props.required ? "" : "optional",
                hide: (field: FormlyFieldConfig) =>
                  field.options.formState.mainModel?.properties
                    ?.isInspireIdentified === undefined,
              },
              change: (field: FormlyFieldConfig, $event) =>
                options.thesaurusTopics &&
                this.keywordAnalysis.updateIsoCategory($event, field.form),
              remove: (field: FormlyFieldConfig, $event) =>
                options.thesaurusTopics &&
                this.keywordAnalysis.updateIsoCategory(
                  $event,
                  field.form,
                  true,
                ),
              validators: {
                ...(this.showInVeKoSField && {
                  invekos_gsaa: {
                    expression: (
                      ctrl: FormControl,
                      field: FormlyFieldConfig,
                    ) => {
                      const invekosValue =
                        field.options.formState.mainModel?.properties?.invekos
                          ?.key;
                      if (invekosValue !== "gsaa") return true;

                      return ctrl.value?.some(
                        (item: any) => item.key === "304",
                      );
                    },
                    message: "Das Schlagwort 'Bodennutzung' ist verpflichtend",
                  },
                  invekos_lpis: {
                    expression: (
                      ctrl: FormControl,
                      field: FormlyFieldConfig,
                    ) => {
                      const invekosValue =
                        field.options.formState.mainModel?.properties?.invekos
                          ?.key;
                      if (invekosValue !== "lpis") return true;

                      return ctrl.value?.some(
                        (item: any) => item.key === "202",
                      );
                    },
                    message:
                      "Das Schlagwort 'Bodenbedeckung' ist verpflichtend",
                  },
                }),
              },
            })
          : null,
        this.addRepeatList("openDataCategories", "OpenData-Kategorien", {
          view: "chip",
          asSelect: true,
          showSearch: true,
          options: this.getCodelistForSelect("6400", "openDataCategories"),
          codelistId: "6400",
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              this.options.dynamicHide.openDataCategories(field),
            "props.required": (field: FormlyFieldConfig) =>
              this.options.dynamicRequired.openDataCategories(field),
          },
        }),
        this.showHVD
          ? this.addRepeatList("hvdCategories", "HVD-Kategorien", {
              view: "chip",
              showSearch: true,
              asSelect: true,
              expressions: {
                hide: (field: FormlyFieldConfig) =>
                  field.model.properties?.isHvd !== true,
              },
              options: this.getCodelistForSelect(
                "hvdCategories",
                "hvdCategories",
              ),
              codelistId: "hvdCategories",
              required: true,
            })
          : null,
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
                codelistId: "6350",
                expressions: {
                  hide: (field: FormlyFieldConfig) =>
                    field.options.formState.mainModel?.properties
                      ?.isInspireIdentified === undefined,
                },
              },
            )
          : null,
        options.spatialScope // TODO: check if hide can be simplified
          ? this.addSelect(
              "spatialScope",
              "INSPIRE - Räumlicher Anwendungsbereich",
              {
                showSearch: true,
                options: this.getCodelistForSelect("6360", "spatialScope"),
                codelistId: "6360",
                expressions: {
                  "props.required": (field: FormlyFieldConfig) =>
                    this.options.dynamicRequired.spatialScope(field),
                  className: (field: FormlyFieldConfig) =>
                    field.props.required ? "" : "optional",
                  hide: (field: FormlyFieldConfig) =>
                    field.model.properties?.isInspireIdentified === undefined,
                },
              },
            )
          : null,
        options.thesaurusTopics
          ? this.addRepeatList("topicCategories", "ISO-Themenkategorie", {
              view: "chip",
              asSelect: true,
              showSearch: true,
              options: this.getCodelistForSelect("527", "topicCategories"),
              codelistId: "527",
              required: this.options.required.topicCategories,
              remove: (field, event) =>
                this.checkConnectedIsoCategory(event, field),
              validators: {
                ...(this.showInVeKoSField && {
                  invekos: {
                    expression: (
                      ctrl: FormControl,
                      field: FormlyFieldConfig,
                    ) => {
                      const invekosValue =
                        field.options.formState.mainModel?.properties?.invekos
                          ?.key;
                      if (invekosValue !== "gsaa" && invekosValue !== "lpis")
                        return true;

                      return ctrl.value?.some((item: any) => item.key === "1");
                    },
                    message:
                      "Das Schlagwort 'Landwirtschaft' ist verpflichtend",
                  },
                }),
              },
            })
          : null,
        this.addGroupSimple("keywords", [
          this.addRepeatList("gemet", "Gemet-Schlagworte", {
            view: "chip",
            className: "optional",
            placeholder: "Im Gemet suchen",
            restCall: (query: string) =>
              this.http.get<any[]>(
                `${ConfigService.backendApiUrl}keywords/gemet?q=${query}`,
              ),
            labelField: "label",
            selectLabelField: (item) => {
              return item.alternativeLabel
                ? `${item.label} (${item.alternativeLabel})`
                : item.label;
            },
            validators: {
              ...(this.showInVeKoSField && {
                invekos: {
                  expression: (ctrl: FormControl, field: FormlyFieldConfig) => {
                    const invekosValue =
                      field.options.formState.mainModel?.properties?.invekos
                        ?.key;
                    if (invekosValue !== "gsaa" && invekosValue !== "lpis")
                      return true;

                    return ctrl.value?.some(
                      (item: any) => item.label === "Gemeinsame Agrarpolitik",
                    );
                  },
                  message:
                    "Das Schlagwort 'Gemeinsame Agrarpolitik' ist verpflichtend",
                },
              }),
            },
          }),
          this.addRepeatList("umthes", "Umthes-Schlagworte", {
            view: "chip",
            className: "optional",
            placeholder: "Im Umweltthesaurus suchen",
            restCall: (query: string) =>
              this.http.get<any[]>(
                `${ConfigService.backendApiUrl}keywords/umthes?q=${query}`,
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
            required: this.options.required.freeKeywords,
            hint: this.keywordFieldHint,
            convert: (val) => (val ? { label: val } : null),
            labelField: "label",
            expressions: {
              className: (field: FormlyFieldConfig) =>
                field.props.required ? "" : "optional",
            },
          }),
        ]),
        this.addInput(null, "Schlagwortanalyse", {
          className: "optional",
          wrappers: ["panel", "button", "form-field"],
          placeholder: this.transloco.translate("form.placeholder.enter"),
          contextHelpId: "keywordanalysis",
          hintStart: "Mehrere Schlagworte durch Komma trennen",
          hideInPreview: true,
          buttonConfig: {
            text: "Analysieren",
            onClick: async (_, field) => {
              await this.analyzeKeywords(field, options);
            },
          },
          validators: {
            mustBeEmptyBeforeSave: {
              expression: (ctrl: FormControl) => {
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
      ].filter(Boolean),
    );
  }

  private async analyzeKeywords(
    field: FormlyFieldConfig,
    options: KeywordSectionOptions,
  ) {
    const value = field.formControl.value;
    if (!value) return;

    field.formControl.setValue("Schlagworte werden analysiert ...");
    field.formControl.disable();
    this.snack.dismiss();

    const formState = field.options.formState;
    const checkThemes =
      options.inspireTopics &&
      formState.mainModel?.["properties"]?.isInspireIdentified;
    try {
      const response = await this.keywordAnalysis.analyzeKeywords(
        value.split(","),
        checkThemes,
      );
      if (response.length == 0) return;

      this.keywordAnalysis.updateForm(
        response,
        field.form,
        this.thesaurusTopics,
      );
      this.informUserAboutThesaurusAnalysis(response);
    } catch (error: any) {
      throw new IgeError(
        `Es gab ein Problem bei der Schlagwortanalyse: ${error.error?.errorText}`,
        error.stack,
      );
    } finally {
      field.formControl.enable();
      field.formControl.setValue("");
    }
  }

  private informUserAboutThesaurusAnalysis(res: Awaited<ThesaurusResult>[]) {
    this.snack.openFromComponent(ThesaurusReportComponent, {
      duration: 20000,
      data: res,
    });
  }

  private checkConnectedIsoCategory(event: any, field: FormlyFieldConfig) {
    const themes = field.form.get("themes");
    // if themes are removed because not INSPIRE-relevant, then ignore
    if (!themes) return;

    const possibleKeys = Object.keys(
      KeywordAnalysis.inspireToIsoMapping,
    ).filter((key) => KeywordAnalysis.inspireToIsoMapping[key] === event.key);
    const connectedInspireTheme = themes.value.find(
      (item: any) => possibleKeys.indexOf(item.key) !== -1,
    );
    if (connectedInspireTheme) {
      const topicCategoriesCtrl = field.form.get("topicCategories");
      topicCategoriesCtrl.setValue([...topicCategoriesCtrl.value, event]);
      const inspireThemeValue = this.codelistStore.getCodelistEntryValueByKey(
        "6100",
        connectedInspireTheme.key,
      );
      this.snack.open(
        `Die Kategorie muss bestehen bleiben, solange das INSPIRE-Thema '${inspireThemeValue}' verwendet wird.`,
      );
    }
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
            hasInlineContextHelp: true,
            defaultValue: defaultSpatial ? defaultSpatial : undefined,
            expressions: {
              "props.required": (field: FormlyFieldConfig) =>
                this.options.dynamicRequired.spatialReferences(field),
            },
          }),
          this.addRepeatList("spatialSystems", "Koordinatenreferenzsysteme", {
            asSelect: false,
            showSearch: true,
            options: this.getCodelistForSelect("100", "spatial.spatialSystems"),
            codelistId: "100",
            expressions: {
              "props.required": (field: FormlyFieldConfig) =>
                this.options.dynamicRequired.spatialSystems(field),
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
                      "props.required": (field: FormlyFieldConfig) =>
                        isNotEmptyObject(field.form.value),
                    },
                  }),
                  this.addInputInline("maximumValue", "Maximum", {
                    type: "number",
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                    expressions: {
                      "props.required": (field: FormlyFieldConfig) =>
                        isNotEmptyObject(field.form.value),
                    },
                  }),
                  this.addSelectInline("unitOfMeasure", "Maßeinheit", {
                    options: this.getCodelistForSelect(
                      "102",
                      "spatial.verticalExtent.unitOfMeasure",
                    ),
                    codelistId: "102",
                    showSearch: true,
                    allowNoValue: true,
                    wrappers: ["inline-help", "form-field"],
                    hasInlineContextHelp: true,
                    expressions: {
                      "props.required": (field: FormlyFieldConfig) =>
                        isNotEmptyObject(field.form.value),
                    },
                  }),
                ],
                {
                  wrappers: [],
                  validators: {
                    bigger: {
                      expression: (_: any, b: any) => {
                        return (
                          !b.model?.minimumValue ||
                          b.model?.minimumValue <= b.model?.maximumValue
                        );
                      },
                      message: () => "Der Wert muss größer als Minimum sein",
                      errorPath: "maximumValue",
                    },
                  },
                },
              ),
              this.addGroup(
                null,
                null,
                [
                  this.addAutoCompleteInline("Datum", "Vertikaldatum", {
                    options: this.getCodelistForSelect(
                      "101",
                      "spatial.verticalExtent.Datum",
                    ),
                    codelistId: "101",
                    expressions: {
                      "props.required": (field: FormlyFieldConfig) =>
                        isNotEmptyObject(field.form.value),
                    },
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                  }),
                ],
                { wrappers: [], hasInlineContextHelp: true },
              ),
            ],
            {
              fieldGroupClassName: "",
              expressions: {
                className: (field: FormlyFieldConfig) =>
                  isNotEmptyObject(field.form.value?.verticalExtent)
                    ? ""
                    : "optional",
              },
            },
          ),
          this.addTextArea("description", "Erläuterungen", "spatial", {
            className: "optional flex-1",
            contextHelpId: "descriptionSpacial",
          }),
        ].filter(Boolean),
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
              wrappers: ["form-field"],
              className: "flex-3",
              required: true,
              options: this.getCodelistForSelect(
                "502",
                "temporal.events.referenceDateType",
              ),
              codelistId: "502",
            }),
          ],
          validators: {
            ...(this.showInVeKoSField && {
              invekos: {
                expression: (ctrl: FormControl, field: FormlyFieldConfig) => {
                  const invekosValue =
                    field.options.formState.mainModel?.properties?.invekos?.key;
                  if (invekosValue !== "gsaa" && invekosValue !== "lpis")
                    return true;

                  // Mindestens ein Datum vom Typ "revision" muss vorhanden
                  return ctrl.value?.some(
                    (item: any) => item.referenceDateType?.key === "3",
                  );
                },
                message:
                  "Es muss mindestens ein Datum vom Typ 'Letzte Änderung' vorhanden sein",
              },
            }),
          },
        }),
        this.addGroup(
          null,
          "Durch die Ressource abgedeckte Zeitspanne",
          [
            this.addSelect("resourceDateType", null, {
              required: this.options.required.resourceDateType,
              showSearch: true,
              wrappers: ["form-field"],
              options: [
                { label: "am", value: "at" },
                { label: "bis", value: "till" },
                { label: "von", value: "since" },
              ],
            }),
            this.addSelect("resourceDateTypeSince", null, {
              required: this.options.required.resourceDateType,
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
                hide: (field: FormlyFieldConfig) =>
                  field.options.formState.mainModel?.temporal?.resourceDateType
                    ?.key !== "since",
              },
            }),
            this.addDatepicker("resourceDate", null, {
              required: this.options.required.resourceDateType,
              placeholder: "TT.MM.JJJJ",
              wrappers: ["form-field"],
              expressions: {
                hide: (field: FormlyFieldConfig) =>
                  field.options.formState.mainModel?.temporal
                    ?.resourceDateTypeSince?.key === "exactDate",
              },
            }),
            this.addDateRange("resourceRange", null, {
              required: this.options.required.resourceDateType,
              wrappers: [],
              expressions: {
                hide: (field: FormlyFieldConfig) =>
                  field.options.formState.mainModel?.temporal
                    ?.resourceDateTypeSince?.key !== "exactDate",
              },
            }),
          ],
          {
            className: this.options.required.resourceDateType ? "" : "optional",
            required: this.options.required.resourceDateType,
            contextHelpId: "resourceTime",
          },
        ),
        this.addSelect("status", "Status", {
          showSearch: true,
          options: this.getCodelistForSelect("523", "temporal.status"),
          codelistId: "523",
          className: "optional",
        }),
      ]),
      this.addGroupSimple("maintenanceInformation", [
        this.addSelect("maintenanceAndUpdateFrequency", "Periodizität", {
          showSearch: true,
          options: this.getCodelistForSelect(
            "518",
            "maintenanceInformation.maintenanceAndUpdateFrequency",
          ),
          codelistId: "518",
          className: "optional",
        }),
        this.addGroup(
          "userDefinedMaintenanceFrequency",
          "Intervall der Erhebung",
          [
            this.addInputInline("number", "Anzahl", {
              type: "number",
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  isNotEmptyObject(field.form.value),
              },
              validators: {
                validation: ["positiveNum"],
              },
            }),
            this.addSelectInline("unit", "Einheit", {
              showSearch: true,
              options: this.getCodelistForSelect(
                "1230",
                "maintenanceInformation.userDefinedMaintenanceFrequency.unit",
              ),
              codelistId: "1230",
              className: "flex-3",
              allowNoValue: true,
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  isNotEmptyObject(field.form.value),
              },
            }),
          ],
          {
            expressions: {
              className: (field: FormlyFieldConfig) =>
                isNotEmptyObject(field.form.value) ? "" : "optional",
            },
          },
        ),
        this.addTextArea("description", "Erläuterungen", "dataset", {
          className: "optional flex-1",
          contextHelpId: "maintenanceNote",
        }),
      ]),
    ]);
  }

  addAdditionalInformationSection(
    options: AdditionalInformationSectionOptions = {},
  ) {
    return this.addSection(
      "Zusatzinformation",
      [
        this.addGroupSimple("metadata", [
          this.addSelect("language", "Sprache des Metadatensatzes", {
            showSearch: true,
            options: this.getCodelistForSelect("99999999", "metadata.language"),
            codelistId: "99999999",
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
                  "99999999",
                  "dataset.languages",
                ),
                codelistId: "99999999",
                required: this.options.required.extraInfoLangData,
                defaultValue: ["150"],
                className: this.options.required.extraInfoLangData
                  ? ""
                  : "optional",
              }),
            ])
          : null,
        options.extraInfoCharSetData
          ? this.addGroupSimple("metadata", [
              this.addSelect("characterSet", "Zeichensatz des Datensatzes", {
                showSearch: true,
                options: this.getCodelistForSelect(
                  "510",
                  "metadata.characterSet",
                ),
                codelistId: "510",
                className: "optional",
              }),
            ])
          : null,
        options.conformity
          ? this.addTable("conformanceResult", "Konformität", {
              supportUpload: false,
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  field.options.formState.mainModel?.properties
                    ?.isInspireIdentified !== undefined,
                className: (field: FormlyFieldConfig) =>
                  field.props.required ? "" : "optional",
              },
              dialog: ConformityDialogComponent,
              columns: [
                {
                  key: "specification",
                  type: "ige-select",
                  label: "Spezifikation",
                  props: {
                    required: true,
                    label: "Spezifikation",
                    appearance: "outline",
                    // needed just to wait for codelist being loaded
                    options: this.getCodelistForSelect(
                      "6005",
                      "conformanceResult.specification",
                    ),
                    formatter: (item: any, _form: any, row: any) =>
                      this.formatCodelistValue(
                        row.isInspire ? "6005" : "6006",
                        item,
                      ),
                  },
                },
                {
                  key: "pass",
                  type: "ige-select",
                  label: "Grad",
                  width: "130px",
                  props: {
                    required: true,
                    label: "Grad",
                    appearance: "outline",
                    options: this.getCodelistForSelect(
                      "6000",
                      "conformanceResult.pass",
                    ),
                    codelistId: "6000",
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
                  expression: (ctrl: FormControl, field: FormlyFieldConfig) => {
                    const model = field.options.formState.mainModel;
                    return (
                      !model ||
                      !this.isGeoService ||
                      model.properties?.isInspireIdentified !== "conform" ||
                      this.conformityExists(ctrl, "10", "1")
                    );
                  },
                  message:
                    "Die Konformität 'VERORDNUNG (EG) Nr. 976/2009...' muss vorhanden sein und den Wert 'konform' haben",
                },
                inspireConformGeodataset: {
                  expression: (ctrl: FormControl, field: FormlyFieldConfig) => {
                    const model = field.options.formState.mainModel;
                    return (
                      !model ||
                      !this.isGeoDataset ||
                      model.properties?.isInspireIdentified !== "conform" ||
                      this.conformityExists(ctrl, "12", "1")
                    );
                  },
                  message:
                    "Die Konformität 'VERORDNUNG (EG) Nr. 1089/2010...' muss vorhanden sein und den Wert 'konform' haben",
                },
                inspireNotConformGeodataset: {
                  expression: (ctrl: FormControl, field: FormlyFieldConfig) => {
                    const model = field.options.formState.mainModel;
                    return (
                      !model ||
                      !this.isGeoDataset ||
                      model?.["properties"]?.isInspireIdentified ===
                        "conform" ||
                      !this.conformityExists(ctrl, "12", "1")
                    );
                  },
                  message:
                    "Die Konformität 'VERORDNUNG (EG) Nr. 1089/2010...' muss vorhanden sein und der Wert darf nicht 'konform' sein",
                },
                uniqueConformity: {
                  expression: (_: any, field: FormlyFieldConfig) => {
                    const value = field.formControl.value;
                    const specs: string[] =
                      value?.map(
                        (item: any) =>
                          item.isInspire +
                          (item.specification.key ?? item.specification.value),
                      ) ?? [];
                    return specs.length === new Set(specs).size;
                  },
                  message: "Jede Spezifikation darf nur einmal auftreten",
                },
              },
            })
          : null,
        this.addGroupSimple("extraInfo", [
          this.addRepeatList(
            "legalBasicsDescriptions",
            "Rechtliche Grundlagen",
            {
              asSelect: false,
              showSearch: true,
              options: this.getCodelistForSelect(
                "1350",
                "extraInfo.legalBasicsDescriptions",
              ),
              codelistId: "1350",
              className: "optional",
            },
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
              },
            ),
          ],
          { className: "optional" },
        ),
      ].filter(Boolean),
    );
  }

  addAvailabilitySection() {
    return this.addSection("Verfügbarkeit", [
      this.addGroupSimple("resource", [
        this.addRepeatList("accessConstraints", "Zugriffsbeschränkungen", {
          asSelect: false,
          showSearch: true,
          options: this.getCodelistForSelect(
            "6010",
            "resource.accessConstraints",
          ),
          codelistId: "6010",
          expressions: {
            "props.required": (field: FormlyFieldConfig) =>
              this.options.dynamicRequired.accessConstraints(field),
            className: (field: FormlyFieldConfig) =>
              field.props.required ? "" : "optional",
          },
        }),
        this.addRepeat("useConstraints", "Nutzungsbedingungen", {
          required: this.options.required.useConstraints,
          expressions: {
            "props.minLength": (field: FormlyFieldConfig) =>
              field.props.required ? 1 : undefined,
            defaultValue: (field: FormlyFieldConfig) =>
              field.props.required ? [{}] : null,
            className: (field: FormlyFieldConfig) =>
              field.props.required ? "" : "optional",
          },
          fields: [
            this.addAutocomplete("title", null, {
              required: true,
              options: this.getCodelistForSelect(
                "6500",
                "resource.useConstraints.title",
              ),
              fieldLabel: "Lizenz",
              codelistId: "6500",
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
            required: this.options.required.useLimitation,
            className: "optional flex-1",
          },
        ),
      ]),
      this.addGroupSimple("distribution", [
        this.addRepeat("format", "Datenformat", {
          expressions: {
            "props.required": (field: FormlyFieldConfig) =>
              this.options.dynamicRequired.dataFormat(field),
            className: (field: FormlyFieldConfig) =>
              field.props.required ? "" : "optional",
          },
          fields: [
            this.addAutoCompleteInline("name", "Name", {
              options: this.getCodelistForSelect(
                this.codelistIds.distributionFormat,
                "distribution.format.name",
              ),
              codelistId: this.codelistIds.distributionFormat,
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
      ]),
      this.addRepeat("digitalTransferOptions", "Medienoption", {
        className: "optional",
        fields: [
          this.addSelectInline("name", "Medium", {
            showSearch: true,
            options: this.getCodelistForSelect(
              "520",
              "digitalTransferOptions.name",
            ),
            codelistId: "520",
          }),
          this.addUnitInputInline("transferSize", "Datenvolumen", {
            type: "number",
            className: "right-align",
            unitOptions: <SelectOption[]>[
              new SelectOption("MB", "MB"),
              new SelectOption("GB", "GB"),
              new SelectOption("TB", "TB"),
            ],
            fieldGroup: [{ key: "value" }, { key: "unit" }],
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
        viewComponent: ReferenceViewComponent,
        validators: {
          downloadLinkWhenOpenData: {
            expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
              !field.form.value.properties?.isOpenData ||
              ctrl.value?.some((row: any) => row.type?.key === "9990") || // one reference of type "Datendownload"
              field.form.value.fileReferences?.length > 0, // or one item in "Dateien"
            message:
              "Bei aktivierter 'Open Data'-Checkbox muss mindestens ein Link vom Typ 'Datendownload' angegeben sein ODER eine Datei im Abschnitt 'Dateien' hochgeladen werden.",
          },
          requiredFieldsInItems: {
            expression: (ctrl: FormControl) =>
              !ctrl.value ||
              ctrl.value.length === 0 ||
              (<any[]>ctrl.value)?.every(
                (row) =>
                  row.type &&
                  row.title?.length > 0 &&
                  ((row.url?.length > 0 && row.uuidRef == null) ||
                    (row.url == null && row.uuidRef?.length > 0)),
              ),
            message:
              "Es müssen alle Pflichtfelder in den Verweisen ausgefüllt sein",
          },
        },
      }),
    ]);
  }

  addFileReferences() {
    return this.addSection("Dateien", [
      this.addRepeatDistributionDetailList("fileReferences", "Dateien", {
        required: false,
        supportLink: false,
        enableFileUploadOverride: false,
        enableFileUploadReuse: false,
        backendUrl: this.configService.getConfiguration().backendUrl,
        infoText:
          "Nutzen Sie soweit möglich maschinenlesbare Dateiformate für Ihre Daten.",
        jsonTemplate: {
          format: null,
          title: "",
          description: "",
        },
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
                contextHelpId: "distribution_upload",
                validators: {
                  validation: ["url"],
                },
                onClick: (docUuid: string, uri: string, $event: any) => {
                  this.uploadService.downloadFile(docUuid, uri, $event);
                },
              },
              expressions: {
                "props.label": (field: FormlyFieldConfig) =>
                  field.formControl.value?.asLink
                    ? "URL (Link)"
                    : "Dateiname (Upload)",
              },
            },
            this.addAutoCompleteInline("format", "Format", {
              required: true,
              options: this.getCodelistForSelect(
                this.codelistIds.fileReferenceFormat,
                "fileReferences.format",
              ),
              codelistId: this.codelistIds.fileReferenceFormat,
              wrappers: ["inline-help", "form-field"],
              hasInlineContextHelp: true,
            }),
            this.addTextAreaInline("description", "Beschreibung", "ingrid", {
              wrappers: ["form-field", "inline-help"],
              hasInlineContextHelp: true,
              contextHelpId: "distribution_description",
            }),
          ]),
        ],
        validators: {
          requiredFormat: {
            expression: (ctrl: FormControl) => {
              if (!ctrl.value || ctrl.value.length === 0) {
                return true;
              }
              return ctrl.value?.every(
                (entry: any) => entry?.format?.key || entry?.format?.value,
              );
            },
            message:
              "Fehler: Es muss für jedes Dokument ein Format angegeben werden (Dokument bearbeiten).",
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

  addDoiFields(): FormlyFieldConfig {
    let doiPrefix =
      this.behaviourService.getBehaviour("plugin.ingrid.doi")?.data?.doiPrefix;
    return this.addGroup(null, "DOI", [
      this.addInputInline("doi", "DOI", {
        defaultValue: doiPrefix ? doiPrefix + "/" : "",
        validators: {
          validation: ["doi"],
        },
        hasInlineContextHelp: true,
        wrappers: ["inline-help", "form-field"],
      }),
      this.addAutoCompleteInline(
        "generalResourceType",
        "Ressourcen Typ (generell)",
        {
          options: this.getCodelistForSelect("3390", "generalResourceType"),
          codelistId: "3390",
          hasInlineContextHelp: true,
          wrappers: ["inline-help", "form-field"],
        },
      ),
      this.addAutoCompleteInline("resourceType", "Ressourcen Typ", {
        options: this.getCodelistForSelect("3386", "resourceType"),
        codelistId: "3386",
        hasInlineContextHelp: true,
        wrappers: ["inline-help", "form-field"],
      }),
    ]);
  }

  protected urlRefFields() {
    return this.addGroupSimple(null, [
      { key: "_type" },
      this.addAutoCompleteInline("type", "Typ", {
        required: true,
        options: this.getCodelistForSelect("2000", "references.type").pipe(
          map((data) => {
            const mappedDoctype = this.mapDocumentTypeToClass(this.id);
            return data.filter(
              (item) =>
                this.codelistStore
                  .getCodelistEntryByKey("2000", item.value)
                  ?.data?.split(",")
                  ?.indexOf(mappedDoctype) !== -1,
            );
          }),
        ),
        codelistId: "2000",
        wrappers: ["inline-help", "form-field"],
        hasInlineContextHelp: true,
      }),
      this.addInputInline("title", "Titel", {
        required: true,
        wrappers: ["inline-help", "form-field"],
        hasInlineContextHelp: true,
        updateOn: "change",
      }),
      this.addRadioboxes("referenceType", "Verweistyp:", {
        defaultValue: "url",
        options: [
          {
            value: "Externe URL",
            id: "url",
          },
          {
            value: "Interner Datensatz",
            id: "uuidRef",
          },
        ],
      }),
      this.addDocumentCard("uuidRef", {
        docTypeFilter: [],
        label: "Datensatzverweis",
        allowRedirectToDocument: false,
        allowMultiSelect: false,
        titleOfDocumentSelectorDialog: "Internen Verweis hinzufügen",
        required: true,
        expressions: {
          hide: (field: FormlyFieldConfig) => {
            return field.form.value.referenceType != "uuidRef";
          },
        },
      }),
      this.addGroupSimple(
        null,
        [
          this.addInputInline("url", "URL", {
            wrappers: ["inline-help", "form-field"],
            className: "flex-3",
            hasInlineContextHelp: true,
            updateOn: "change",
            expressions: {
              hide: (field: FormlyFieldConfig) => {
                return field.form.value.referenceType != "url";
              },
              "props.required": (field: FormlyFieldConfig) => {
                return !field.form.value?.uuidRef;
              },
              "props.label": (field: FormlyFieldConfig) => {
                return field.props.disabled
                  ? "URL (nur bei leerem Datensatzverweis)"
                  : "URL";
              },
            },
            validation: {
              messages: {
                required:
                  "Entweder URL oder Datensatzverweis muss ausgefüllt sein",
              },
            },
          }),
          this.addAutoCompleteInline(
            "urlDataType",
            this.transloco.translate("form.references.fileFormat"),
            {
              options: this.getCodelistForSelect(
                this.codelistIds.urlDataType,
                "references.urlDataType",
              ),
              codelistId: this.codelistIds.urlDataType,
              wrappers: ["inline-help", "form-field"],
              hasInlineContextHelp: true,
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  field.form.value?.type?.key === "9990", // Datendownload
                hide: (field: FormlyFieldConfig) => {
                  return field.form.value.referenceType != "url";
                },
              },
            },
          ),
        ],
        { fieldGroupClassName: "flex-row gap-12" },
      ),
      this.addGroupSimple(null, [
        this.addTextAreaInline("explanation", "Erläuterungen", {
          wrappers: ["inline-help", "form-field"],
          hasInlineContextHelp: true,
        }),
      ]),
    ]);
  }

  protected titleDateEditionFields(
    codelistForTitle: string,
    prefixPath: string,
  ) {
    return [
      this.addAutoCompleteInline("title", "Titel", {
        className: "flex-3",
        wrappers: ["form-field"],
        required: true,
        options: this.getCodelistForSelect(
          codelistForTitle,
          prefixPath + "citation.title",
        ),
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

  handleActivateInspireIdentifiedFromGeoservice(
    field: FormlyFieldConfig,
  ): Observable<boolean> {
    const cookieId = "HIDE_INSPIRE_INFO";

    if (this.cookieService.getCookie(cookieId) === "true") {
      this.handleActivateInspireIdentified(field);
      return of(true);
    }

    const message = this.inspireChangeMessage;

    return this.showConfirmDialog(message, cookieId).pipe(
      map((decision) => {
        if (decision === "ok") this.handleActivateInspireIdentified(field);
        else
          field.formControl.setValue({
            ...field.formControl.value,
            isInspireIdentified: undefined,
          });
        return decision === "ok";
      }),
    );
  }

  private showConfirmDialog(
    message: string,
    cookieId: string,
  ): Observable<string> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: message,
          cookieId: cookieId,
        },
      })
      .afterClosed();
  }

  handleDeactivateInspireIdentifiedFromGeoservice(
    field: FormlyFieldConfig,
  ): Observable<boolean> {
    const cookieId = "HIDE_INSPIRE_DEACTIVATE_INFO";

    if (this.cookieService.getCookie(cookieId) === "true") {
      this.handleDeactivateInspireIdentified(field);
      return of(true);
    }

    const message = this.inspireDeleteMessage;

    return this.showConfirmDialog(message, cookieId).pipe(
      map((decision) => {
        if (decision === "ok") this.handleDeactivateInspireIdentified(field);
        else
          field.formControl.setValue({
            ...field.formControl.value,
            isInspireIdentified: "relevant",
          });
        return decision === "ok";
      }),
    );
  }

  handleActivateInspireIdentified(field: FormlyFieldConfig) {
    const isOpenData = field.formControl.value.isOpenData === true;

    if (this.isGeoService) {
      if (isOpenData) {
        field.form.get("resource.accessConstraints")?.setValue([{ key: "1" }]);
      }

      this.addConformanceEntry(field, "10", "1");
    }
  }

  handleDeactivateInspireIdentified(field: FormlyFieldConfig) {
    const isOpenData = field.formControl.value.isOpenData === true;
    const specificationToRemove = this.isGeoService ? "10" : "12";
    if (isOpenData) field.form.get("resource.accessConstraints").setValue([]);

    const conformanceResultCtrl = field.form.get("conformanceResult");
    // only set conformance value when field is available (#6535)
    if (conformanceResultCtrl) {
      conformanceResultCtrl.setValue(
        (conformanceResultCtrl.value ?? []).filter(
          (item: any) => item.specification?.key !== specificationToRemove,
        ),
      );
    }
  }

  private conformityExists(
    ctrl: FormControl,
    specKey: string,
    passKey: string,
  ) {
    return ctrl.value?.some(
      (row: any) =>
        row.specification?.key === specKey && row.pass?.key === passKey,
    );
  }

  private addConformanceEntry(
    fieldConfig: FormlyFieldConfig,
    specificationKey: string,
    passKey: string,
  ) {
    const publicationDate = this.codelistStore.getCodelistEntryByKey(
      "6005",
      specificationKey,
    )?.data;
    const conformanceResultCtrl = fieldConfig.form.get("conformanceResult");
    const conformanceValues = (conformanceResultCtrl.value ?? []).filter(
      (item: any) => item.specification?.key !== specificationKey,
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
    conformanceResultCtrl.setValue(conformanceValues);
  }

  private handleIsInspireConformClick(
    field: FormlyFieldConfig,
    previousValue: any = undefined,
  ): Observable<boolean> {
    const cookieId = "HIDE_INSPIRE_CONFORM_INFO";
    const inspireIdentified = field.formControl.value.isInspireIdentified;
    const isConform = inspireIdentified === "conform";

    const executeAction = () => {
      if (previousValue?.isInspireIdentified === undefined) {
        this.handleActivateInspireIdentified(field);

        if (isConform) {
          this.addConformanceEntry(field, "12", "1");
        } else {
          this.addConformanceEntry(field, "12", "2");
        }
      } else if (inspireIdentified === undefined) {
        this.handleDeactivateInspireIdentified(field);
      }
    };

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return of(true);
    }

    const message =
      inspireIdentified === undefined
        ? this.inspireDeleteMessage
        : this.inspireChangeMessage;
    return this.showConfirmDialog(message, cookieId).pipe(
      map((decision) => {
        if (decision === "ok") executeAction();
        else
          field.formControl.setValue({
            ...field.formControl.value,
            isInspireIdentified: previousValue?.isInspireIdentified,
          });
        return decision === "ok";
      }),
    );
  }

  /**
   * Empty adv-product list when adv checkbox was deselected
   */
  private handleAdvClick(field: FormlyFieldConfig) {
    const isChecked = field.formControl.value.isAdVCompatible;
    const advProductGroupsCtrl = field.form.get("advProductGroups");
    const advProductGroups = advProductGroupsCtrl.value;
    if (isChecked || !advProductGroups || advProductGroups.length === 0) return;

    advProductGroupsCtrl.setValue([]);
    this.snack.open("Die AdV-Produktgruppe wurde automatisch geleert");
  }

  private getPriorityDatasets(): Observable<SelectOptionUi[]> {
    return this.codelistService.observeRaw("6350").pipe(
      map((codelist) => {
        const cls = CodelistService.mapToSelect(
          codelist,
          "de",
          this.sortFunctionPriorityDatasets,
        );
        return cls.map((item) =>
          this.adaptPriorityDatasetItem(item, codelist.entries),
        );
      }),
    );
  }

  private sortFunctionPriorityDatasets(
    a: CodelistEntry,
    b: CodelistEntry,
    language: string,
  ): number {
    const labelA = a.fields[language];
    const labelB = b.fields[language];
    // put INVALID items to the end of the list
    if (labelA.indexOf("INVALID -") === 0) return 1;
    if (labelB.indexOf("INVALID -") === 0) return -1;
    return labelA?.localeCompare(labelB);
  }

  private adaptPriorityDatasetItem(
    item: SelectOptionUi,
    entries: CodelistEntry[],
  ) {
    if (item.value === "_SEPARATOR_") return item;
    const entry = entries.find((e) => e.id === item.value);
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

  private mapDocumentTypeToClass(id: string) {
    switch (id) {
      case "InGridSpecialisedTask":
        return "0";
      case "InGridGeoDataset":
        return "1";
      case "InGridPublication":
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

  protected handleInVeKoSBehaviour() {
    const behaviour = this.behaviourService.getBehaviour(
      "plugin.ingrid.invekos",
    );
    this.showInVeKoSField = behaviour?.isActive() ?? behaviour?.defaultActive;
  }

  protected handleDoiBehaviour() {
    const behaviour = this.behaviourService.getBehaviour("plugin.ingrid.doi");
    this.showDoiFields = behaviour?.isActive() ?? behaviour?.defaultActive;
  }

  private handleHVDClick(field: FormlyFieldConfig) {
    const hvdChecked = field.formControl.value.isHvd;
    const isOpenData = field.formControl.value.isOpenData;
    // if hvd is checked and field is not open data, show open data dialog
    if (hvdChecked && !isOpenData) {
      return this.handleActivateOpenData(field).pipe(
        tap((success) =>
          success
            ? field.formControl.setValue({
                ...field.formControl.value,
                isOpenData: true,
              })
            : field.formControl.setValue({
                ...field.formControl.value,
                isHvd: false,
              }),
        ),
      );
    } else {
      return of(true);
    }
  }

  private handleInVeKosChange(
    field: FormlyFieldConfig,
    hasThesaurusTopics: boolean,
  ) {
    const value = field.formControl.value.invekos?.key;
    if (!value) return;

    this.addInVeKoSKeyword(field, "iacs");

    const executeAction = (value: string) => {
      if (value === "gsaa") {
        // INSPIRE Thema "Land use" Pflicht ("Bodennutzung")
        this.addInspireTopic(field, "304", hasThesaurusTopics);
        this.addInVeKoSKeyword(field, "gsaa");
      }
      if (value === "lpis") {
        // INSPIRE Thema "Land cover" Pflicht ("Bodenbedeckung")
        this.addInspireTopic(field, "202", hasThesaurusTopics);
        this.addInVeKoSKeyword(field, "lpis");
      }

      if (value === "gsaa" || value === "lpis") {
        // GEMET Schlagwort "Common Agricultural Policy" Pflicht
        this.addGemet(field, {
          id: "http://www.eionet.europa.eu/gemet/concept/1600",
          label: "Gemeinsame Agrarpolitik",
          alternativeLabel: null,
        });
        // als Topic Category muss "farming" ausgewählt werden
        this.addTopicCategory(field, "1");
      }
    };

    const cookieId = "HIDE_INVEKOS_INFO";

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction(value);
      return of(true);
    }

    this.showConfirmDialog(
      `Dem Datensatz werden folgende Schlagworte hinzugefügt:
        <ul>
          <li>InVeKoS: InVeKoS${
            value === "gsaa" ? " + GSAA" : value === "lpis" ? " + LPIS" : ""
          }</li>
          <li>Gemet: Gemeinsame Agrarpolitik</li><li>ISO-Themenkategorie: Landwirtschaft</li>
          <li>INSPIRE-Themen: ${
            value === "gsaa" ? "Bodennutzung" : "Bodenbedeckung"
          }</li>
        </ul>`,
      cookieId,
    ).subscribe((decision) => {
      if (decision === "ok") executeAction(value);
      else
        field.formControl.setValue({
          ...field.formControl.value,
          invekos: undefined,
        });
    });
  }

  private addInspireTopic(
    fieldConfig: FormlyFieldConfig,
    id: string,
    hasThesaurusTopics: boolean,
  ) {
    const themesCtrl = fieldConfig.form.get("themes");
    const exists = themesCtrl.value.some((entry: any) => entry.key === id);
    if (!exists) {
      const itemTheme = { key: id };
      themesCtrl.setValue([...themesCtrl.value, itemTheme]);
      if (hasThesaurusTopics) {
        this.keywordAnalysis.updateIsoCategory(itemTheme, fieldConfig.form);
      }
    }
  }

  private addTopicCategory(fieldConfig: FormlyFieldConfig, id: string) {
    const topicCategoriesCtrl = fieldConfig.form.get("topicCategories");
    const exists = topicCategoriesCtrl.value.some(
      (entry: any) => entry.key === id,
    );
    if (!exists) {
      const topicCategory = { key: id };
      topicCategoriesCtrl.setValue([
        ...topicCategoriesCtrl.value,
        topicCategory,
      ]);
    }
  }

  private addInVeKoSKeyword(fieldConfig: FormlyFieldConfig, id: string) {
    const uri = `http://inspire.ec.europa.eu/metadata-codelist/IACSData/${id}`;
    const invekosKeywordsCtrl = fieldConfig.form.get("invekosKeywords");
    if (!invekosKeywordsCtrl.value) invekosKeywordsCtrl.setValue([]);
    const exists = invekosKeywordsCtrl.value.some(
      (entry: any) => entry.key === uri,
    );
    if (!exists) {
      const topicCategory = { key: uri };
      invekosKeywordsCtrl.setValue([
        ...invekosKeywordsCtrl.value,
        topicCategory,
      ]);
    }
  }

  private addGemet(fieldConfig: FormlyFieldConfig, item: any) {
    const keywordsGemetCtrl = fieldConfig.form.get("keywords.gemet");
    const exists = keywordsGemetCtrl.value?.some(
      (entry: any) => entry.id === item.id,
    );
    if (!exists) {
      keywordsGemetCtrl.setValue([...keywordsGemetCtrl.value, item]);
    }
  }
}
