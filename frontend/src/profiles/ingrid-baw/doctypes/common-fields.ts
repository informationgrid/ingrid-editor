/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
import {
  FormFieldHelper,
  InputOptions,
  SelectOptions,
} from "../../form-field-helper";
import { Injectable } from "@angular/core";
import { IngridShared } from "../../ingrid/doctypes/ingrid-shared";
import { GeoDatasetDoctypeBaw } from "./geo-dataset.doctype";
import { isNotEmptyObject } from "../../../app/shared/utils";
import { tap } from "rxjs/operators";
import { LfsViewComponent } from "../components/lfs-view/lfs-view.component";
import {
  PreviewImageComponent,
  PreviewImageSelector,
} from "../../../app/formly/types/preview-image/preview-image.component";
import { LfsSelectorDialogComponent } from "../components/lfs-selector/lfs-selector-dialog.component";

@Injectable({ providedIn: "root" })
export class CommonFieldsBaw extends FormFieldHelper {
  getBAWOrderInfoFieldConfig(
    doc: IngridShared,
    options: SelectOptions = {},
  ): FormlyFieldConfig {
    return this.addSelect("bawOrderInfo", "Auftrag", {
      showSearch: true,
      required: true,
      options: doc.getCodelistForSelect("bawOrderInfo", "null"),
      codelistId: "bawOrderInfo",
      wrappers: ["panel", "form-field"],
      ...options,
    });
  }

  getBAWKeywordCatalogueFieldConfig(doc: IngridShared): FormlyFieldConfig {
    return doc.addRepeatList("bawKeywords", "BAW - Schlagwortkatalog", {
      showSearch: true,
      view: "chip",
      className: "optional",
      asSelect: true,
      options: doc.getCodelistForSelect("3950005", "null"),
    });
  }

  getTimestepFieldConfig(options: InputOptions = {}): FormlyFieldConfig {
    return this.addInput("timestep", "Zeitliche Genauigkeit", {
      type: "number",
      className: "single-field width-25 right-align",
      suffix: {
        text: "s",
      },
      wrappers: ["panel", "form-field", "addons"],
      ...options,
    });
  }

  getVerticalSpatialSystemsFieldConfig(doc: IngridShared): FormlyFieldConfig {
    return this.addRepeatList(
      "verticalSpatialSystems",
      "Raumbezugssystem (Höhe)",
      {
        asSelect: true,
        showSearch: true,
        options: doc.getCodelistForSelect("verticalSpatialSystems", "null"),
        codelistId: "verticalSpatialSystems",
      },
    );
  }

  getInlineVerticalSpatialSystemsFieldConfig(
    doc: IngridShared,
    selectOptions: SelectOptions = {},
  ): FormlyFieldConfig {
    return this.addSelectInline("verticalSpatialSystems", "Höhenbezugssystem", {
      options: doc.getCodelistForSelect("verticalSpatialSystems", "null"),
      ...selectOptions,
    });
  }

  getUnitOfMeasurementFieldConfig(doc: IngridShared) {
    return this.addAutoCompleteInline("unitOfMeasurement", "Einheit", {
      required: true,
      options: doc.getCodelistForSelect("3950020", "null"),
    });
  }

  isBawAdminLocked(field: FormlyFieldConfig): boolean {
    const publishState = field.options.formState.metadata.state;
    const isPublished = publishState === "P" || publishState === "PW";

    return !this.config.hasCatAdminRights() && isPublished;
  }

  applyAdminLock(field: FormlyFieldConfig) {
    if (!field) return;
    if (!field.expressions) {
      field.expressions = {};
    }
    field.expressions["props.disabled"] = (f: FormlyFieldConfig) =>
      field?.options?.formState?.disabled ?? this.isBawAdminLocked(f);
  }

  applyBawAdminLocks(fieldConfig: FormlyFieldConfig[]) {
    // DOI-Felder
    ["doi", "generalResourceType", "resourceType"].forEach((id) => {
      this.applyAdminLock(
        IngridShared.findFieldElementWithId(fieldConfig, id)?.field,
      );
    });

    // Zugriffsbeschränkungen, Nutzungsbedingungen, Anwendungseinschränkungen
    ["accessConstraints", "useConstraints", "otherConstraints"].forEach(
      (id) => {
        this.applyAdminLock(
          IngridShared.findFieldElementWithId(fieldConfig, id)?.field,
        );
      },
    );

    // "Erstmalige Veröffentlichung" (beim Zeitbezug)
    this.applyAdminLock(
      IngridShared.findFieldElementWithId(
        fieldConfig,
        "firstPublished",
        "event",
      )?.field,
    );
  }

  addSharedFields(
    doc: IngridShared,
    fieldConfig: FormlyFieldConfig[],
    exclude: {
      verticalSpatialSystems?: boolean;
      verticalExtent?: boolean;
    } = {},
  ) {
    const timeRefRangePosition = IngridShared.findFieldElementWithId(
      fieldConfig,
      "data",
    );
    timeRefRangePosition.field.props.showTimepicker = true;
    timeRefRangePosition.field.props.showTimezone = true;
    timeRefRangePosition.field.props.defaultTimezone = "(GMT+01:00) Berlin";

    const gemetKeywordsPosition = IngridShared.findFieldElementWithId(
      fieldConfig,
      "gemet",
    );

    // Baugrunddynamik Schlagwortkatalog
    this.addBefore(
      gemetKeywordsPosition,
      this.addRepeatList("subsoilKeywords", "Baugrunddynamik-Schlagworte", {
        showSearch: true,
        view: "chip",
        className: "optional",
        asSelect: true,
        options: doc.getCodelistForSelect("3950007", "null"),
      }),
    );

    // BAW Schlagwortkatalog
    this.addBefore(
      gemetKeywordsPosition,
      this.getBAWKeywordCatalogueFieldConfig(doc),
    );

    const spatialSystemPosition = IngridShared.findFieldElementWithId(
      fieldConfig,
      "spatialSystems",
    );

    // Vertikale Koordinatenreferenzsysteme
    if (!exclude.verticalSpatialSystems) {
      this.addAfter(
        spatialSystemPosition,
        this.getVerticalSpatialSystemsFieldConfig(doc),
      );
    }

    // replace existing vertical extent section with baw specific one
    if (!exclude.verticalExtent) {
      const verticalExtentPosition = IngridShared.findFieldElementWithId(
        fieldConfig,
        "verticalExtent",
      );
      verticalExtentPosition.fieldConfig.splice(
        verticalExtentPosition.index,
        1,
        this.getBAWVerticalExtentFieldConfig(doc),
      );
    }

    // add lfs picker to preview image / graphicOverviews
    const graphicOverviewsPosition = IngridShared.findFieldElementWithId(
      fieldConfig,
      "graphicOverviews",
    );
    graphicOverviewsPosition.fieldConfig[graphicOverviewsPosition.index] =
      this.getBAWGraphicOverviewsFieldConfig();

    const pointOfContactPosition = IngridShared.findFieldElementWithId(
      fieldConfig,
      "pointOfContact",
    );

    // reuse existing ingrid field validators
    pointOfContactPosition.fieldConfig[pointOfContactPosition.index] =
      this.getBAWPointOfContactFieldConfig(
        doc,
        pointOfContactPosition.fieldConfig[pointOfContactPosition.index]
          .validators,
      );

    // LFS references & literature references
    const referencesPosition = IngridShared.findFieldElementWithId(
      fieldConfig,
      "references",
    );
    this.addAfter(referencesPosition, this.getLfsReferencesFieldConfig(doc));
    this.addAfter(referencesPosition, this.getLiteratureReferenceFieldConfig());

    // remove fileReferences
    const fileReferencesPosition = this.findParentFieldElementWithId(
      fieldConfig,
      "fileReferences",
    );
    fileReferencesPosition?.fieldConfig.splice(fileReferencesPosition.index, 1);

    //remove parentIdentifier as it is set automatically in baw
    const parentIdentifierPosition = IngridShared.findFieldElementWithId(
      fieldConfig,
      "parentIdentifier",
    );
    parentIdentifierPosition?.fieldConfig.splice(
      parentIdentifierPosition.index,
      1,
    );

    this.applyBawAdminLocks(fieldConfig);
  }

  getBAWPointOfContactFieldConfig(
    doctype: IngridShared,
    additionalValidators: {} = {},
  ): FormlyFieldConfig {
    // all types except "Verfahrensbetreuung" (13) and "Entwickler" (14)
    const allGeneralTypes = Array.from({ length: 12 }, (_, i) =>
      (i + 1).toString(),
    );

    return this.addAddressCard("pointOfContact", "Adressen", {
      required: true,
      // allow all types for BawSoftware Doctype (based on InGridInformationSystem).
      // allow only allGeneralTypes for all other doctypes
      allowedTypes:
        doctype.id != "InGridInformationSystem" ? allGeneralTypes : null,
      // only "Herausgeber" (10) and "Autor" (11) for PublicationAddressDocs
      allowedTypesByAddressType: { PublicationAddressDoc: ["10", "11"] },
      validators: {
        // Require reference to address 'Bundesanstalt für Wasserbau' as 'Ansprechpartner'
        // deactivated for now as it was deactivated in the production ige classic as well
        // hasBAWPointOfContact: this.hasBAWPointOfContact,
        ...additionalValidators,
      },
    });
  }

  getBAWGraphicOverviewsFieldConfig() {
    return this.addPreviewImage("graphicOverviews", "Vorschaugrafik", {
      disableUpload: true,
      className: "optional",
      additionalSelectors: [
        <PreviewImageSelector>{
          label: "Aus LFS wählen",
          action: this.lfsLinkDialog,
        },
      ],
    });
  }

  lfsLinkDialog(ref: PreviewImageComponent) {
    ref.dialog
      .open(LfsSelectorDialogComponent)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          ref.add(null, {
            fileName: {
              asLink: true,
              uri: "https://dl.datenfinder.baw.de/LFS/" + result.lfs.uuid,
              value: result.lfs.uuid,
            },
            fileDescription: result.description,
          });
        }
      });
  }

  getBAWVerticalExtentFieldConfig(doc: IngridShared) {
    return this.addGroup(
      "verticalExtent",
      "Vertikale Ausdehnung",
      [
        this.addGroup(
          null,
          null,
          [
            this.addInputInline("minimumValue", "Minimum", {
              type: "number",
              hasInlineContextHelp: true,
              wrappers: ["inline-help", "form-field", "addons"],
              className: "right-align flex-1",
              suffix: {
                text: "m",
              },
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  isNotEmptyObject(field.form.value),
              },
            }),
            this.addInputInline("maximumValue", "Maximum", {
              type: "number",
              hasInlineContextHelp: true,
              wrappers: ["inline-help", "form-field", "addons"],
              className: "right-align flex-1",
              suffix: {
                text: "m",
              },
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  isNotEmptyObject(field.form.value),
              },
            }),
            this.addAutoCompleteInline("Datum", "Raumbezugssystem", {
              options: doc.getCodelistForSelect(
                "verticalSpatialSystems",
                "null",
              ),
              codelistId: "verticalSpatialSystems",
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  isNotEmptyObject(field.form.value),
              },
              hasInlineContextHelp: true,
              className: "flex-2",
              wrappers: ["inline-help", "form-field"],
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
    );
  }

  addSharedGeoDatasetFields(
    doc: GeoDatasetDoctypeBaw,
    fieldConfig: FormlyFieldConfig[],
  ) {
    const alternateTitlePosition = IngridShared.findFieldElementWithId(
      fieldConfig,
      "alternateTitle",
    );

    // Auftragsnummer / -titel
    this.addBefore(
      alternateTitlePosition,
      this.getBAWOrderInfoFieldConfig(doc),
    );

    this.addSharedFields(doc, fieldConfig);
  }

  getLiteratureReferenceFieldConfig(): FormlyFieldConfig {
    return this.addGroup(null, "Literatur-Verweise", [
      <FormlyFieldConfig>{
        key: "literatureReferences",
        type: "couplingService",
        className: "flex-1",
        props: {
          label: "Literatur-Verweise",
          onlyInternalRefs: true,
          titleOfDocumentSelectorDialog: "Literatur-Datensatz auswählen",
          docTypeFilter: ["BawPublication"],
        },
      },
    ]);
  }

  getLfsReferencesFieldConfig(doc: IngridShared): FormlyFieldConfig {
    return this.addRepeatDetailList("lfsReferences", "LFS-Dateien", {
      viewComponent: LfsViewComponent,
      fields: [
        this.addLongTermFileStorageCard("file", {
          docTypeFilter: [],
          label: "Datensatzverweis",
          allowRedirectToDocument: false,
          allowMultiSelect: false,
          titleOfDocumentSelectorDialog: "Datei auswählen",
          required: true,
          hideHeader: true,
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              return field.options.fieldChanges.pipe(
                tap((value) => {
                  const lfsFileTitle = value.value?.title;
                  // TODO Should the root title be overwritten if the lfs file changes?
                  const overridingTitle = field.formControl.root.value?.title;
                  if (lfsFileTitle && !overridingTitle) {
                    field.formControl.root.patchValue({
                      title: lfsFileTitle,
                    });
                  }
                }),
              );
            },
          },
        }),
        this.addGroupSimple(
          null,
          [
            this.addInputInline("title", "Titel", {
              required: true,
              wrappers: ["inline-help", "form-field"],
              hasInlineContextHelp: true,
              updateOn: "change",
            }),
            this.addAutoCompleteInline(
              "fileFormat",
              this.transloco.translate("form.references.fileFormat"),
              {
                options: doc.getCodelistForSelect("1320", "null"),
                codelistId: "1320",
                wrappers: ["inline-help", "form-field"],
                hasInlineContextHelp: true,
                contextHelpId: "urlDataType",
                required: true,
              },
            ),
          ],
          { fieldGroupClassName: "flex-row gap-12" },
        ),
        this.addTextAreaInline("explanation", "Erläuterung", {
          wrappers: ["inline-help", "form-field"],
          hasInlineContextHelp: true,
        }),
        this.addExplanationText("lfsHint", "Hinweis", {
          explanation: this.transloco.translate("form.lfsDescription"),
          buttonLink: this.config.getConfiguration().lfsMoveResourcesUrl,
        }),
      ],
    });
  }
}
