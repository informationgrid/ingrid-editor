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
import { inject, Injectable } from "@angular/core";
import { CommonFieldsBaw } from "./common-fields";
import { IngridShared } from "../../ingrid/doctypes/ingrid-shared";

@Injectable({
  providedIn: "root",
})
export class PublicationDoctypeBaw extends IngridShared {
  common = inject(CommonFieldsBaw);

  id = "BawPublication";

  label = "Literatur / Medien";

  iconClass = "Publikation-Dokument";

  hasOptionalFields = true;

  constructor() {
    super();
    this.options.required.extraInfoLangData = true;

    this.options.hide = {
      ...this.options.hide,
      ...{
        maintenanceInformation: true,
        temporalStatus: true,
        digitalTransferOptions: true,
        orderInfo: true,
        legalBasicsDescriptions: true,
      },
    };
  }

  documentFields = () => {
    const fields = <FormlyFieldConfig[]>[
      this.addGeneralSection(),
      this.addKeywordsSection(),
      this.addSection("Fachbezug", [
        this.addGroupSimple("publication", [
          this.addInput("isbn", "ISBN-Nr.", {
            wrappers: ["panel", "form-field"],
            className: "optional",
          }),
          this.addInput("issn", "ISSN-Nr.", {
            wrappers: ["panel", "form-field"],
            className: "optional",
          }),
          this.addRepeat("additionalIdentifiers", "Weitere Identifikatoren", {
            fields: [
              this.addSelectInline("type", "Identifikatortyp", {
                required: true,
                options: this.getCodelistForSelect("identifierType", "null"),
              }),
              this.addInputInline("value", "Identifikator", { required: true }),
            ],
          }),
          this.addAutocomplete("documentType", "Dokumententyp", {
            options: this.getCodelistForSelect("3385", "documentType"),
            codelistId: "3385",
            className: "optional",
          }),
        ]),
      ]),

      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({ extraInfoLangData: true }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
      this.addFileReferences(),
    ];

    return this.manipulateDocumentFields(fields);
  };

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    // Update default fields
    this.updateProps(
      "description",
      { externalLabel: "Kurzfassung/Beschreibung", required: false },
      fieldConfig,
    );
    this.updateProps(
      "alternateTitle",
      { externalLabel: "Alternativer Titel" },
      fieldConfig,
    );

    // Add new fields
    this.common.addSharedFields(this, fieldConfig);
    const parentIdentifierPosition = this.findFieldElementWithId(
      fieldConfig,
      "parentIdentifier",
    );

    // Auftragsnummer
    this.addBefore(
      parentIdentifierPosition,
      this.addRepeatList("orderNumbers", "Auftragsnummer"),
    );
    // Auftragstitel
    this.addBefore(
      parentIdentifierPosition,
      this.addRepeatList("orderTitles", "Auftragstitel"),
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
        options: this.getCodelistForSelect("3950005", "null"),
      }),
    );

    this.updateValidators(
      "events",
      { hasPublicationDate: this.common.hasPublicationDate },
      fieldConfig,
    );

    return fieldConfig;
  };
}
