/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
import { FormControl } from "@angular/forms";
import { GeoDatasetDoctypeBaw } from "./geo-dataset.doctype";
import { isNotEmptyObject } from "../../../app/shared/utils";
import { timezones } from "./timezones";
import { ReferenceViewComponent } from "../../ingrid/components/reference-view/reference-view.component";
import { tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class CommonFieldsBaw extends FormFieldHelper {
  getOrderTitleFieldConfig(options: InputOptions = {}): FormlyFieldConfig {
    return this.addInput("orderTitle", "Auftragstitel", {
      required: true,
      wrappers: ["panel", "form-field"],
      ...options,
    });
  }

  getOrderNumberFieldConfig(options: InputOptions = {}): FormlyFieldConfig {
    return this.addInput("orderNumber", "Auftragsnummer", {
      required: true,
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

  addSharedFields(
    doc: IngridShared,
    fieldConfig: FormlyFieldConfig[],
    exclude: {
      verticalSpatialSystems?: boolean;
      verticalExtent?: boolean;
    } = {},
  ) {
    const timeRefPosition = this.findFieldElementWithId(
      fieldConfig,
      "resourceDate",
    );

    const content = timeRefPosition.fieldConfig[timeRefPosition.index];
    timeRefPosition.fieldConfig[timeRefPosition.index] = this.addGroupSimple(
      null,
      [content, this.addTimepickerInline("resourceDate", "Zeit", {})],
      {
        fieldGroupClassName: "flex-row",
        className: "two-sub-fields",
        hideExpression: (field: FormlyFieldConfig) =>
          field.model.resourceDateTypeSince?.key === "exactDate",
      },
    );

    const timeRefRangePosition = this.findFieldElementWithId(
      fieldConfig,
      "resourceRange",
    );
    timeRefRangePosition.fieldConfig[
      timeRefRangePosition.index
    ].props.showTimeInputs = true;
    this.addAfter(
      timeRefRangePosition,
      this.addSelectInline("resourceTimezone", "Zeitzone", {
        options: timezones,
        defaultValue: {
          key: "(GMT+01:00) Berlin",
        },
        showSearch: true,
      }),
    );

    const gemetKeywordsPosition = this.findFieldElementWithId(
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

    const spatialSystemPosition = this.findFieldElementWithId(
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
      const verticalExtentPosition = this.findFieldElementWithId(
        fieldConfig,
        "verticalExtent",
      );
      verticalExtentPosition.fieldConfig.splice(
        verticalExtentPosition.index,
        1,
        this.getBAWVerticalExtentFieldConfig(doc),
      );
    }

    const pointOfContactPosition = doc.findFieldElementWithId(
      fieldConfig,
      "pointOfContact",
    );

    // reuse existing ingrid field validators
    pointOfContactPosition.fieldConfig[pointOfContactPosition.index] =
      this.getBAWPointOfContactFieldConfig(
        pointOfContactPosition.fieldConfig[pointOfContactPosition.index]
          .validators,
      );

    // LFS references & literature references
    const referencesPosition = this.findFieldElementWithId(
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
    const parentIdentifierPosition = this.findFieldElementWithId(
      fieldConfig,
      "parentIdentifier",
    );
    parentIdentifierPosition?.fieldConfig.splice(
      parentIdentifierPosition.index,
      1,
    );
  }

  getBAWPointOfContactFieldConfig(
    additionalValidators: {} = {},
  ): FormlyFieldConfig {
    return this.addAddressCard("pointOfContact", "Adressen", {
      required: true,
      // only "Herausgeber" and "Autor"
      allowedTypesByDoctype: { PublicationAddressDoc: ["10", "11"] },
      validators: {
        // Require reference to address 'Bundesanstalt für Wasserbau' as 'Ansprechpartner'
        // deactivated for now as it was deactivated in the production ige classic as well
        // hasBAWPointOfContact: this.hasBAWPointOfContact,
        ...additionalValidators,
      },
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
    const alternateTitlePosition = this.findFieldElementWithId(
      fieldConfig,
      "alternateTitle",
    );

    // Auftragsnummer
    this.addBefore(alternateTitlePosition, this.getOrderNumberFieldConfig());
    // Auftragstitel
    this.addBefore(alternateTitlePosition, this.getOrderTitleFieldConfig());

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
    // TODO Define required fields
    return this.addRepeatDetailList("lfsReferences", "LFS-Dateien", {
      viewComponent: ReferenceViewComponent,
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
                required: false,
              },
            ),
          ],
          { fieldGroupClassName: "flex-row gap-12" },
        ),
        this.addTextAreaInline("explanation", "Erläuterung", {
          wrappers: ["inline-help", "form-field"],
          hasInlineContextHelp: true,
        }),
      ],
    });
  }

  removeDataQualitySection(
    doc: IngridShared,
    fieldConfig: FormlyFieldConfig[],
  ) {
    const dataQualitySection = doc.findFieldElementWithId(
      fieldConfig,
      "dataQuality",
    );
    if (dataQualitySection) {
      fieldConfig.splice(dataQualitySection.index, 1);
    }
  }

  hasBAWPointOfContact = {
    expression: (ctrl: FormControl, _: FormlyFieldConfig) =>
      // equals "Herausgeber"
      ctrl.value
        ? ctrl.value.some(
            (address) =>
              address.type?.key === "7" &&
              address.ref === "891d8fdf-e6cf-3f61-9ca4-668880483ca8",
          )
        : false,
    message:
      "Ein Eintrag für die Institution 'Bundesanstalt für Wasserbau' als 'Ansprechpartner' muss vorhanden sein",
  };

  hasPublicationDate = {
    expression: (ctrl: FormControl, _: FormlyFieldConfig) =>
      // equals "Publikation"
      ctrl.value
        ? ctrl.value.some((item) => item.referenceDateType?.key === "2")
        : false,
    message:
      "Es muss mindestens ein Datum vom Typ 'Publikation' vorhanden sein",
  };
}
