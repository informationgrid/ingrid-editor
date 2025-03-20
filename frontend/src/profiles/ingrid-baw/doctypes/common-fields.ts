/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { FormFieldHelper, InputOptions } from "../../form-field-helper";
import { Injectable } from "@angular/core";
import { IngridShared } from "../../ingrid/doctypes/ingrid-shared";
import { FormControl } from "@angular/forms";
import { GeoDatasetDoctypeBaw } from "./geo-dataset.doctype";
import { isNotEmptyObject } from "../../../app/shared/utils";

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
      fieldLabel: "Zeitliche Genauigkeit",
      type: "number",
      className: "single-field width-25 right-align",
      suffix: {
        text: "s",
      },
      wrappers: ["panel", "form-field", "addons"],
      ...options,
    });
  }

  getVerticalCoordinateReferenceSystemFieldConfig(
    doc: IngridShared,
  ): FormlyFieldConfig {
    return this.addRepeatList(
      "verticalCoordinateReferenceSystem",
      "Raumbezugssystem (Höhe)",
      {
        asSelect: false,
        showSearch: true,
        options: doc.getCodelistForSelect(
          "verticalCoordinateReferenceSystem",
          "null",
        ),
        codelistId: "verticalCoordinateReferenceSystem",
      },
    );
  }

  getInlineVerticalCoordinateReferenceSystemFieldConfig(
    doc: IngridShared,
  ): FormlyFieldConfig {
    return this.addSelectInline(
      "verticalCoordinateReferenceSystem",
      "Höhenbezugssystem",
      {
        required: true,
        options: doc.getCodelistForSelect(
          "verticalCoordinateReferenceSystem",
          "null",
        ),
      },
    );
  }

  getUnitOfMeasurementFieldConfig(doc: IngridShared) {
    return this.addSelectInline("unitOfMeasurement", "Einheit", {
      required: true,
      options: doc.getCodelistForSelect("3950020", "null"),
    });
  }

  addSharedFields(doc: IngridShared, fieldConfig: FormlyFieldConfig[]) {
    const gemetKeywordsPosition = this.findFieldElementWithId(
      fieldConfig,
      "gemet",
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
    this.updateProps(
      "spatialSystems",
      { externalLabel: "Raumbezugssystem (Lage)" },
      fieldConfig,
    );

    // Vertikale Koordinatenreferenzsysteme
    this.addAfter(
      spatialSystemPosition,
      this.getVerticalCoordinateReferenceSystemFieldConfig(doc),
    );

    // replace existing vertical extent section with baw specific one
    const verticalExtentPosition = this.findFieldElementWithId(
      fieldConfig,
      "verticalExtent",
    );
    verticalExtentPosition.fieldConfig.splice(
      verticalExtentPosition.index,
      1,
      this.getBAWVerticalExtentFieldConfig(doc),
    );

    // Require reference to address 'Bundesanstalt für Wasserbau' as 'Ansprechpartner'
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

    this.addAfter(pointOfContactPosition, this.getPublisherFieldConfig());
  }

  getBAWPointOfContactFieldConfig(
    additionalValidators: {} = {},
  ): FormlyFieldConfig {
    return this.addAddressCard("pointOfContact", "Adressen", {
      required: true,
      // only "Herausgeber" and "Autor"
      allowedTypesByDoctype: { PublicationAddressDoc: ["10", "11"] },
      validators: {
        // TODO: add if needed
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
            this.addAutoCompleteInline("Datum", "Raumbezugssystem", {
              options: doc.getCodelistForSelect(
                "verticalCoordinateReferenceSystem",
                "null",
              ),
              codelistId: "verticalCoordinateReferenceSystem",
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
    );
  }

  getPublisherFieldConfig(): FormlyFieldConfig {
    return this.addAddressCard("publisher", "Herausgeber", {
      // required: true,
      max: 1,
      allowedTypes: ["10"],
    });
  }

  addSharedGeoDatasetFields(
    doc: GeoDatasetDoctypeBaw,
    fieldConfig: FormlyFieldConfig[],
  ) {
    const parentIdentifierPosition = this.findFieldElementWithId(
      fieldConfig,
      "parentIdentifier",
    );

    // Auftragsnummer
    this.addBefore(parentIdentifierPosition, this.getOrderNumberFieldConfig());
    // Auftragstitel
    this.addBefore(parentIdentifierPosition, this.getOrderTitleFieldConfig());

    this.addSharedFields(doc, fieldConfig);
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
            // TODO: was address.institution (title) in ige classic. refactor or define reserved address.ref
            // also check if functionality is still needed
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
