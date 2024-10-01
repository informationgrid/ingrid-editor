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
import { AbstractControl, FormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { firstValueFrom, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { CodelistEntry } from "../../../app/store/codelist/codelist.model";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { ThesaurusReportComponent } from "../components/thesaurus-report.component";
import { ThesaurusResult } from "../components/thesaurus-result";
import { ConfigService } from "../../../app/services/config/config.service";
import { BehaviourService } from "../../../app/services/behavior/behaviour.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { KeywordAnalysis, KeywordSectionOptions } from "../utils/keywords";
import {
  MetadataOptionItems,
  MetadataProps,
} from "../../../app/formly/types/metadata-type/metadata-type.component";

interface GeneralSectionOptions {
  // additionalGroup?: FormlyFieldConfig;
  inspireRelevant?: boolean;
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
  private documentService = inject(DocumentService);
  private keywordAnalysis = inject(KeywordAnalysis);

  options = {
    dynamicRequired: {
      accessConstraints:
        "formState.mainModel?.['my-metadata']?.isInspireIdentified",
      openDataCategories: undefined,
      spatialReferences: undefined,
      spatialSystems: undefined,
      dataFormat: undefined,
      spatialScope: undefined,
    },
    dynamicHide: {
      openDataCategories: "!formState.mainModel?.['my-metadata']?.isOpenData",
    },
    required: {
      freeKeywords: false,
      useLimitation: false,
      topicCategories: true,
      accessConstraints: false,
      resourceDateType: false,
      spatialReferences: true,
      spatialSystems: false,
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
  showInspireConform: boolean = false;
  showHVD: boolean = false;
  showAdVCompatible: boolean = false;
  showAdVProductGroup: boolean = false;
  /** @deprecated: should be defined in geoservice-doctype */
  isGeoService: boolean = false;
  /** @deprecated: should be defined in geodataset-doctype */
  isGeoDataset: boolean = false;
  private thesaurusTopics: boolean = false;

  defaultKeySpatialScope = null; // Regional

  codelistIds = {
    distributionFormat: "1320",
    urlDataType: "1320",
    fileReferenceFormat: "1320",
  };

  metadataOptions = () =>
    [
      {
        label: "Datentyp",
        typeOptions: [
          {
            multiple: false,
            key: "subType",
            items: [
              { label: "Datensatz", value: { key: 5 } },
              { label: "Datenserie", value: { key: 6 } },
            ],
          },
        ],
      },
      {
        label: "INSPIRE-relevant",
        typeOptions: [
          {
            multiple: false,
            key: "isInspireIdentified",
            onChange: (field, value) => {
              console.log(
                "isInspireIdentified changed",
                field.formControl.value,
              );
              field.props.disabledOptions.invekos = value === undefined;
            },
            items: this.showInspireConform
              ? [
                  {
                    label: "INSPIRE konform",
                    value: "conform",
                    onClick: (field, previousValue) =>
                      this.handleIsInspireConformClick(
                        field,
                        previousValue,
                      ).subscribe(),
                  },
                  {
                    label: "INSPIRE nicht konform",
                    value: "notConform",
                    onClick: (field, previousValue) =>
                      this.handleIsInspireConformClick(
                        field,
                        previousValue,
                      ).subscribe(),
                  },
                ]
              : [
                  {
                    label: "Ja",
                    value: "relevant",
                    // onClick: (field) => this.handleOpenDataClick(field),
                  },
                ],
          },
          this.showInVeKoSField
            ? {
                multiple: false,
                key: "invekos",
                hide: (field: FormlyFieldConfig) =>
                  !field.formControl.value.isInspireIdentified,
                items: [
                  {
                    label: "InVeKoS/IACS (GSAA)",
                    value: { key: "gsaa" },
                    onClick: (field) =>
                      this.handleInVeKosChange(field, this.thesaurusTopics),
                  },
                  {
                    label: "InVeKoS/IACS (LPIS)",
                    value: { key: "lpis" },
                    onClick: (field) =>
                      this.handleInVeKosChange(field, this.thesaurusTopics),
                  },
                  {
                    label: "InVeKoS/IACS (None)",
                    value: { key: "none" },
                    hide: true,
                    onClick: (field) =>
                      this.handleInVeKosChange(field, this.thesaurusTopics),
                  },
                ],
              }
            : null,
        ].filter(Boolean),
      },
      {
        label: "Open Data",
        typeOptions: [
          <MetadataOptionItems>{
            multiple: true,
            items: [
              {
                label: "Offene Lizenz",
                key: "isOpenData",
                value: true,
                onClick: (field) => this.handleOpenDataClick(field),
              },
              this.showHVD
                ? {
                    label: "High-Value-Dataset",
                    key: "hvd",
                    value: true,
                    onClick: (field) => this.handleHVDClick(field).subscribe(),
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
                    key: "isAdVCompatible",
                    value: true,
                    onClick: (field: FormlyFieldConfig) =>
                      this.handleAdvClick(field),
                  },
                ],
              },
            ],
          }
        : null,
    ].filter(Boolean);

  addGeneralSection(options: GeneralSectionOptions = {}): FormlyFieldConfig {
    this.thesaurusTopics = options.thesaurusTopics;
    return this.addGroupSimple(
      null,
      [
        this.addSection("Metadata", [
          <FormlyFieldConfig>{
            key: "my-metadata",
            type: "metadata",

            props: <MetadataProps>{
              availableOptions: this.metadataOptions(),
              disabledOptions: {},
            },
          },
        ]),
        /*options.inspireRelevant || this.showAdVCompatible
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
                        click: (field: FormlyFieldConfig) =>
                          this.handleInspireIdentifiedClick(field),
                      },
                    )
                  : null,
                this.showAdVCompatible
                  ? this.addCheckboxInline(
                      "isAdVCompatible",
                      "AdV kompatibel",
                      {
                        className: "flex-1",
                        click: (field: FormlyFieldConfig) =>
                          this.handleAdvClick(field),
                      },
                    )
                  : null,
              ].filter(Boolean),
            )
          : null,
        this.addRadioboxes("isInspireConform", "INSPIRE konform", {
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              !(this.showInspireConform && field.model.isInspireIdentified),
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
          click: (field: FormlyFieldConfig) =>
            setTimeout(() =>
              this.handleIsInspireConformClick(field).subscribe(),
            ),
        }),
        this.showInVeKoSField
          ? this.addSelect("invekos", "InVeKoS", {
              allowNoValue: false,
              defaultValue: { key: "none" },
              expressions: {
                hide: "!model.isInspireIdentified",
              },
              resetOnHide: false,
              options: [
                {
                  label: "Kein InVeKoS Datensatz",
                  value: "none",
                },
                {
                  label: "InVeKoS/IACS (GSAA)",
                  value: "gsaa",
                },
                {
                  label: "InVeKoS/IACS (LPIS)",
                  value: "lpis",
                },
              ],
              change: (field: FormlyFieldConfig, value: MatSelectChange) => {
                this.handleInVeKosChange(field, value, options.thesaurusTopics);
              },
            })
          : null,
        this.options.hide.openData
          ? null
          : this.addGroup(
              null,
              "Open Data",
              [
                this.addCheckboxInline("isOpenData", "Open Data", {
                  className: "flex-1",
                  click: (field: FormlyFieldConfig) =>
                    this.handleOpenDataClick(field),
                }),
                this.showHVD
                  ? this.addCheckboxInline("hvd", "High-Value-Dataset (HVD)", {
                      className: "flex-1",
                      click: (field: FormlyFieldConfig) =>
                        this.handleHVDClick(field).subscribe(),
                    })
                  : null,
              ].filter(Boolean),
            ),*/
        // options.additionalGroup ? options.additionalGroup : null,
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
                    ? ctrl.value.some((address) => address.type?.key === "12")
                    : false,
                message: "Es muss mindestens einen 'Ansprechpartner MD' geben.",
              },
              atLeastOnePointOfContactWhenAdV: {
                expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
                  // equals "Ansprechpartner"
                  !field.model.isAdVCompatible ||
                  (ctrl.value
                    ? ctrl.value.some((address) => address.type?.key === "7")
                    : false),
                message: "Es muss mindestens einen 'Ansprechpartner' geben.",
              },
              atLeastOneOtherAddress: {
                expression: (ctrl: FormControl) =>
                  // not equals "Ansprechpartner MD"
                  ctrl.value
                    ? ctrl.value.some((address) => address.type?.key !== "12")
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
    const value = field.formControl.value;
    const isInspire = value?.isInspireIdentified;

    function executeAction() {
      const accessConstraintsControl = field.form.get(
        "resource.accessConstraints",
      );
      accessConstraintsControl.setValue(isInspire ? [{ key: "1" }] : []);
    }

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return of(true);
    }

    const message =
      "Wird diese Auswahl gewählt, so:" +
      ' <ul><li>werden alle Zugriffsbeschränkungen entfernt</li>  <li>wird die Angabe einer Opendata-Kategorie unter "Verschlagwortung" verpflichtend</li><li>wird dem Datensatz beim Export in ISO19139 Format automatisch das Schlagwort "opendata" hinzugefügt</li></ul> ';
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: message,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .pipe(
        map((decision) => {
          if (decision === "ok") {
            executeAction();
            return true;
          }
          field.formControl.setValue({ ...value, isOpenData: true });
          return false;
        }),
      );
  }

  handleDeactivateOpenData(field: FormlyFieldConfig): Observable<boolean> {
    const cookieId = "HIDE_OPEN_DATA_DEACTIVATE_INFO";
    if (this.cookieService.getCookie(cookieId) === "true") return of(true);

    const message =
      'Wird dieses Auswahl gewählt, so wird die Opendata-Kategorie unter "Verschlagwortung" entfernt.';
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: message,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .pipe(
        map((decision) => {
          const value = field.formControl.value;
          if (decision === "ok") {
            if (this.showHVD) {
              field.formControl.setValue({ ...value, hvd: false });
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
                "props.required": "formState.mainModel?.isAdVCompatible",
                className: "field.props.required ? '' : 'optional'",
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
                hide: "!formState.mainModel?.['my-metadata']?.isInspireIdentified",
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
                      field.options.formState.mainModel?.invekos?.key;
                    if (!invekosValue || invekosValue === "none") return true;

                    const hasKeyword = (keyword: string) =>
                      ctrl.value?.some(
                        (item) =>
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
                  message: (_, field: any) => {
                    const invekos = field.formControl.root.value.invekos?.key;
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
                "props.required":
                  "formState.mainModel?.['my-metadata']?.isInspireIdentified",
                className: "field.props.required ? '' : 'optional'",
                hide: "!formState.mainModel?.['my-metadata']?.isInspireIdentified",
              },
              change: (field, $event) =>
                options.thesaurusTopics &&
                this.keywordAnalysis.updateIsoCategory($event, field),
              remove: (field, $event) =>
                options.thesaurusTopics &&
                this.keywordAnalysis.updateIsoCategory($event, field, true),
              validators: {
                ...(this.showInVeKoSField && {
                  invekos_gsaa: {
                    expression: (
                      ctrl: FormControl,
                      field: FormlyFieldConfig,
                    ) => {
                      const invekosValue =
                        field.options.formState.mainModel?.invekos?.key;
                      if (invekosValue !== "gsaa") return true;

                      return ctrl.value?.some((item) => item.key === "304");
                    },
                    message: "Das Schlagwort 'Bodennutzung' ist verpflichtend",
                  },
                  invekos_lpis: {
                    expression: (
                      ctrl: FormControl,
                      field: FormlyFieldConfig,
                    ) => {
                      const invekosValue =
                        field.options.formState.mainModel?.invekos?.key;
                      if (invekosValue !== "lpis") return true;

                      return ctrl.value?.some((item) => item.key === "202");
                    },
                    message:
                      "Das Schlagwort 'Bodenbedeckung' ist verpflichtend",
                  },
                }),
              },
            })
          : null,
        this.addRepeatList("openDataCategories", "OpenData - Kategorien", {
          view: "chip",
          asSelect: true,
          showSearch: true,
          required: true,
          options: this.getCodelistForSelect("6400", "openDataCategories"),
          codelistId: "6400",
          expressions: {
            hide: this.options.dynamicHide.openDataCategories,
            "props.required": this.options.dynamicRequired.openDataCategories,
          },
        }),
        this.showHVD
          ? this.addRepeatList("hvdCategories", "HVD-Kategorien", {
              view: "chip",
              showSearch: true,
              asSelect: true,
              expressions: {
                hide: (field: FormlyFieldConfig) => field.model.hvd !== true,
              },
              options: [
                {
                  label: "Georaum",
                  value: "http://data.europa.eu/bna/c_ac64a52d",
                },
                {
                  label: "Erdbeobachtung und Umwelt",
                  value: "http://data.europa.eu/bna/c_dd313021",
                },
                {
                  label: "Meteorologie",
                  value: "http://data.europa.eu/bna/c_164e0bf5",
                },
                {
                  label: "Statistik",
                  value: "http://data.europa.eu/bna/c_e1da4e07",
                },
                {
                  label: "Unternehmen und Eigentümerschaft von Unternehmen",
                  value: "http://data.europa.eu/bna/c_a9135398",
                },
                {
                  label: "Mobilität",
                  value: "http://data.europa.eu/bna/c_b79e35eb",
                },
              ],
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
                  hide: "!formState.mainModel?.['my-metadata']?.isInspireIdentified",
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
                  "props.required": this.options.dynamicRequired.spatialScope,
                  className: "field.props.required ? '' : 'optional'",
                  hide: "!formState.mainModel?.['my-metadata']?.isInspireIdentified",
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
                        field.options.formState.mainModel?.invekos?.key;
                      if (invekosValue !== "gsaa" && invekosValue !== "lpis")
                        return true;

                      return ctrl.value?.some((item) => item.key === "1");
                    },
                    message:
                      "Das Schlagwort 'Landwirtschaft' ist verpflichtend",
                  },
                }),
              },
            })
          : null,
        this.addGroupSimple("keywords", [
          this.addRepeatList("gemet", "Gemet Schlagworte", {
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
                      field.options.formState.mainModel?.invekos?.key;
                    if (invekosValue !== "gsaa" && invekosValue !== "lpis")
                      return true;

                    return ctrl.value?.some(
                      (item) => item.label === "Gemeinsame Agrarpolitik",
                    );
                  },
                  message:
                    "Das Schlagwort 'Gemeinsame Agrarpolitik' ist verpflichtend",
                },
              }),
            },
          }),
          this.addRepeatList("umthes", "Umthes Schlagworte", {
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
              className: "field.props.required ? '' : 'optional'",
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
      formState.mainModel?.["my-metadata"]?.isInspireIdentified;
    const response = await this.keywordAnalysis.analyzeKeywords(
      value.split(","),
      checkThemes,
    );

    if (response.length > 0) {
      this.keywordAnalysis.updateForm(response, field, this.thesaurusTopics);
      this.informUserAboutThesaurusAnalysis(response);
    }

    field.formControl.enable();
    field.formControl.setValue("");
  }

  private informUserAboutThesaurusAnalysis(res: Awaited<ThesaurusResult>[]) {
    this.snack.openFromComponent(ThesaurusReportComponent, {
      duration: 20000,
      data: res,
    });
  }

  private checkConnectedIsoCategory(event, field: FormlyFieldConfig) {
    const themes = field.form.get("themes");
    // if themes are removed because not INSPIRE-relevant, then ignore
    if (!themes) return;

    const possibleKeys = Object.keys(
      KeywordAnalysis.inspireToIsoMapping,
    ).filter((key) => KeywordAnalysis.inspireToIsoMapping[key] === event.key);
    const connectedInspireTheme = themes.value.find(
      (item) => possibleKeys.indexOf(item.key) !== -1,
    );
    if (connectedInspireTheme) {
      const topicCategoriesCtrl = field.form.get("topicCategories");
      topicCategoriesCtrl.setValue([...topicCategoriesCtrl.value, event]);
      const inspireThemeValue = this.codelistQuery.getCodelistEntryValueByKey(
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
            required: this.options.required.spatialReferences,
            hasInlineContextHelp: true,
            defaultValue: defaultSpatial ? defaultSpatial : undefined,
            expressions: {
              "props.required": this.options.dynamicRequired.spatialReferences,
            },
          }),
          this.addRepeatList("spatialSystems", "Koordinatenreferenzsysteme", {
            required: this.options.required.spatialSystems,
            asSelect: false,
            showSearch: true,
            options: this.getCodelistForSelect("100", "spatialSystems"),
            codelistId: "100",
            expressions: {
              "props.required": this.options.dynamicRequired.spatialSystems,
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
                      "spatialRefAltMeasure",
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
                      expression: (_, b: any) => {
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
                      "spatialRefAltVDate",
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
              options: this.getCodelistForSelect("502", "type"),
              codelistId: "502",
            }),
          ],
          validators: {
            ...(this.showInVeKoSField && {
              invekos: {
                expression: (ctrl: FormControl, field: FormlyFieldConfig) => {
                  const invekosValue =
                    field.options.formState.mainModel?.invekos?.key;
                  if (invekosValue !== "gsaa" && invekosValue !== "lpis")
                    return true;

                  // Mindestens ein Datum vom Typ "revision" muss vorhanden
                  return ctrl.value?.some(
                    (item) => item.referenceDateType?.key === "3",
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
                hide: "formState.mainModel?.temporal?.resourceDateType?.key !== 'since'",
              },
            }),
            this.addDatepicker("resourceDate", null, {
              required: this.options.required.resourceDateType,
              placeholder: "TT.MM.JJJJ",
              wrappers: ["form-field"],
              expressions: {
                hide: "formState.mainModel?.temporal?.resourceDateTypeSince?.key === 'exactDate'",
              },
            }),
            this.addDateRange("resourceRange", null, {
              required: this.options.required.resourceDateType,
              wrappers: [],
              expressions: {
                hide: "formState.mainModel?.temporal?.resourceDateTypeSince?.key !== 'exactDate'",
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
          options: this.getCodelistForSelect("523", "timeRefStatus"),
          codelistId: "523",
          className: "optional",
        }),
      ]),
      this.addGroupSimple("maintenanceInformation", [
        this.addSelect("maintenanceAndUpdateFrequency", "Periodizität", {
          showSearch: true,
          options: this.getCodelistForSelect("518", "timeRefPeriodicity"),
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
              options: this.getCodelistForSelect("1230", "timeRefStatus"),
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
            options: this.getCodelistForSelect(
              "99999999",
              "extraInfoLangMetaData",
            ),
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
                  "extraInfoLangData",
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
                options: this.getCodelistForSelect("510", "characterSet"),
                codelistId: "510",
                className: "optional",
              }),
            ])
          : null,
        options.conformity
          ? this.addTable("conformanceResult", "Konformität", {
              supportUpload: false,
              expressions: {
                "props.required":
                  "formState.mainModel?.['my-metadata']?.isInspireIdentified",
                className: "field.props.required ? '' : 'optional'",
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
                    options: this.getCodelistForSelect("6005", "specification"),
                    formatter: (item: any, form: any, row: any) =>
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
                    options: this.getCodelistForSelect("6000", "level"),
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
                      !model.isInspireConform ||
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
                      !model.isInspireConform ||
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
                      model?.["my-metadata"]?.isInspireIdentified ===
                        "conform" ||
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
                "1350",
                "extraInfoLegalBasicsTable",
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
          required: this.options.required.accessConstraints,
          options: this.getCodelistForSelect(
            "6010",
            "availabilityAccessConstraints",
          ),
          codelistId: "6010",
          expressions: {
            "props.required": this.options.dynamicRequired.accessConstraints,
            className: "field.props.required ? '' : 'optional'",
          },
        }),
        this.addRepeat("useConstraints", "Nutzungsbedingungen", {
          required: this.options.required.useConstraints,
          expressions: {
            "props.minLength": "field.props.required ? 1 : undefined",
            defaultValue: "field.props.required ? [{}] : null",
            className: "field.props.required ? '' : 'optional'",
          },
          fields: [
            this.addAutocomplete("title", null, {
              required: true,
              options: this.getCodelistForSelect("6500", "license"),
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
            "props.required": this.options.dynamicRequired.dataFormat,
            className: "field.props.required ? '' : 'optional'",
          },
          fields: [
            this.addAutoCompleteInline("name", "Name", {
              options: this.getCodelistForSelect(
                this.codelistIds.distributionFormat,
                "specification",
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
            options: this.getCodelistForSelect("520", "specification"),
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
        validators: {
          downloadLinkWhenOpenData: {
            expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
              !field.form.value.isOpenData ||
              ctrl.value?.some((row) => row.type?.key === "9990"), // Datendownload
            message:
              "Bei aktivierter 'Open Data'-Checkbox muss mindestens ein Link vom Typ 'Datendownload' angegeben sein",
          },
          requiredFieldsInItems: {
            expression: (ctrl: FormControl) =>
              !ctrl.value ||
              ctrl.value.length === 0 ||
              (<any[]>ctrl.value)?.every(
                (row) =>
                  row.type &&
                  row.title?.length > 0 &&
                  (row.url?.length > 0 || row.uuidRef?.length > 0),
              ),
            message:
              "Es müssen alle Pflichtfelder in den Verweisen ausgefüllt sein",
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
        options: this.getCodelistForSelect("2000", "type").pipe(
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
      this.addGroupSimple(
        null,
        [
          this.addInputInline("url", "URL", {
            wrappers: ["inline-help", "form-field"],
            className: "flex-3",
            hasInlineContextHelp: true,
            updateOn: "change",
            expressions: {
              "props.required": (field: FormlyFieldConfig) => {
                return !field.form.value?.uuidRef;
              },
              "props.disabled": (field: FormlyFieldConfig) => {
                return !!field.form.value?.uuidRef;
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
                "urlDataType",
              ),
              codelistId: this.codelistIds.urlDataType,
              wrappers: ["inline-help", "form-field"],
              hasInlineContextHelp: true,
              expressions: {
                "props.required": 'field.form.value?.type?.key === "9990"', // Datendownload
                "props.disabled": (field: FormlyFieldConfig) => {
                  return !!field.form.value?.uuidRef;
                },
              },
            },
          ),
        ],
        { fieldGroupClassName: "flex-row gap-12" },
      ),
      this.addInputInline("uuidRef", "Datensatzverweis", {
        wrappers: ["inline-help", "form-field"],
        hasInlineContextHelp: true,
        // updateOn: "change",
        expressions: {
          "props.required": (field: FormlyFieldConfig) => {
            return !field.form.value?.url;
          },
          "props.disabled": (field: FormlyFieldConfig) => {
            return !!field.form.value?.url;
          },
          "props.label": (field: FormlyFieldConfig) => {
            return field.props.disabled
              ? "Datensatzverweis (nur bei leerer URL)"
              : "Datensatzverweis";
          },
        },
        validation: {
          messages: {
            required: "Entweder URL oder Datensatzverweis muss ausgefüllt sein",
          },
        },
        asyncValidators: {
          uuidExists: {
            expression: (control: AbstractControl) => {
              if (!control.value) return of(true);
              return firstValueFrom(
                this.documentService.uuidExists(control.value),
              );
            },
            message:
              "Bitte geben Sie eine gültige UUID eines existierenden Datensatzes in diesem Katalog an",
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

  protected titleDateEditionFields(codelistForTitle: string) {
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

  handleActivateInspireIdentified(field: FormlyFieldConfig) {
    const isOpenData = field.formControl.value.isOpenData === true;
    /*    const cookieId = "HIDE_INSPIRE_INFO";

    const executeAction = () => {*/
    // field.formControl.setValue({...field.formControl.value, isInspireIdentified: "conform"});

    if (this.defaultKeySpatialScope) {
      field.form.get("spatialScope").setValue({
        key: this.defaultKeySpatialScope,
      });
    }

    if (this.isGeoService) {
      if (isOpenData) {
        field.form.get("resource.accessConstraints").setValue([{ key: "1" }]);
      }

      this.addConformanceEntry(field, "10", "1");
    } else if (this.isGeoDataset) {
      this.addConformanceEntry(field, "12", "1");
    }
    /*};

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return of(true);
    }

    return this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: this.inspireChangeMessage,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .pipe(
        map((decision) => {
          if (decision === "ok") executeAction();
          else field.formControl.setValue({...field.formControl.value, isInspireIdentified: });
          return decision === "ok";
        }),
      );*/
  }

  handleDeactivateInspireIdentified(field: FormlyFieldConfig) {
    const isOpenData = field.form.get("isOpenData").value === true;
    const specificationToRemove = this.isGeoService ? "10" : "12";
    /*    const cookieId = "HIDE_INSPIRE_DEACTIVATE_INFO";

    const executeAction = () => {*/
    if (isOpenData) field.form.get("resource.accessConstraints").setValue([]);

    const conformanceResultCtrl = field.form.get("conformanceResult");
    // only set conformance value when field is available (#6535)
    if (conformanceResultCtrl) {
      conformanceResultCtrl.setValue(
        (conformanceResultCtrl.value ?? []).filter(
          (item) => item.specification?.key !== specificationToRemove,
        ),
      );
    }
    // };

    /*    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return of(true);
    }

    const message = this.inspireDeleteMessage;

    return this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message: message,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .pipe(
        map((decision) => {
          if (decision === "ok") executeAction();
          else field.formControl.setValue(true);
          return decision === "ok";
        }),
      );*/
  }

  private conformityExists(
    ctrl: FormControl,
    specKey: string,
    passKey: string,
  ) {
    return ctrl.value?.some(
      (row) => row.specification?.key === specKey && row.pass?.key === passKey,
    );
  }

  private addConformanceEntry(
    fieldConfig: FormlyFieldConfig,
    specificationKey: string,
    passKey: string,
  ) {
    const publicationDate = this.codelistQuery.getCodelistEntryByKey(
      "6005",
      specificationKey,
    )?.data;
    const conformanceResultCtrl = fieldConfig.form.get("conformanceResult");
    const conformanceValues = (conformanceResultCtrl.value ?? []).filter(
      (item) => item.specification?.key !== specificationKey,
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
      if (previousValue?.isInspireIdentified === undefined)
        this.handleActivateInspireIdentified(field);
      else if (inspireIdentified === undefined)
        this.handleDeactivateInspireIdentified(field);

      if (isConform) {
        this.addConformanceEntry(field, "12", "1");
      } else {
        this.addConformanceEntry(field, "12", "2");
      }
    };

    if (this.cookieService.getCookie(cookieId) === "true") {
      executeAction();
      return of(true);
    }

    return this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message:
            inspireIdentified === undefined
              ? this.inspireDeleteMessage
              : this.inspireChangeMessage,
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .pipe(
        tap((value) => console.log("dialog closed", value)),
        map((decision) => {
          debugger;
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
    a: SelectOptionUi,
    b: SelectOptionUi,
  ): number {
    // put INVALID items to the end of the list
    if (a.label.indexOf("INVALID -") === 0) return 1;
    if (b.label.indexOf("INVALID -") === 0) return -1;
    return a.label?.localeCompare(b.label);
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
    this.showInVeKoSField = behaviour?.isActive ?? behaviour?.defaultActive;
  }

  private handleHVDClick(field: FormlyFieldConfig) {
    const hvdChecked = field.formControl.value.hvd;
    const metadata = field.formControl.value;
    const isOpenData = metadata.isOpenData;
    // if hvd is checked and field is not open data, show open data dialog
    if (hvdChecked && !isOpenData) {
      return this.handleActivateOpenData(field).pipe(
        tap((success) =>
          success
            ? field.formControl.setValue({ ...metadata, isOpenData: true })
            : field.formControl.setValue({ ...metadata, isOpenData: false }),
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
    const value = field.formControl.value.invekos;
    if (value === "none") return;

    this.addInVeKoSKeyword(field, "iacs");

    const executeAction = (value) => {
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
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Hinweis",
          message:
            "Dem Datensatz werden folgende Schlagworte hinzugefügt: <ul><li>InVeKoS: InVeKoS" +
            (value === "gsaa" ? " + GSAA" : value === "lpis" ? " + LPIS" : "") +
            "</li><li>Gemet: Gemeinsame Agrarpolitik</li><li>ISO-Themenkategorie: Landwirtschaft</li><li>INSPIRE-Themen: " +
            (value === "gsaa" ? "Bodennutzung" : "Bodenbedeckung") +
            "</li></ul>",
          cookieId: cookieId,
        },
      })
      .afterClosed()
      .subscribe((decision) => {
        if (decision === "ok") executeAction(value);
        else field.formControl.setValue({ key: "none" });
      });
  }

  private addInspireTopic(
    fieldConfig: FormlyFieldConfig,
    id: string,
    hasThesaurusTopics: boolean,
  ) {
    const themesCtrl = fieldConfig.form.get("themes");
    const exists = themesCtrl.value.some((entry) => entry.key === id);
    if (!exists) {
      const itemTheme = { key: id };
      themesCtrl.setValue([...themesCtrl.value, itemTheme]);
      if (hasThesaurusTopics) {
        this.keywordAnalysis.updateIsoCategory(itemTheme, fieldConfig);
      }
    }
  }

  private addTopicCategory(fieldConfig: FormlyFieldConfig, id: string) {
    const topicCategoriesCtrl = fieldConfig.form.get("topicCategories");
    const exists = topicCategoriesCtrl.value.some((entry) => entry.key === id);
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
    const exists = invekosKeywordsCtrl.value.some((entry) => entry.key === uri);
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
      (entry) => entry.id === item.id,
    );
    if (!exists) {
      keywordsGemetCtrl.setValue([...keywordsGemetCtrl.value, item]);
    }
  }
}
