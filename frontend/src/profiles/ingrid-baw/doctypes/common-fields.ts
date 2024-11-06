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
import { FormFieldHelper } from "../../form-field-helper";
import { Injectable } from "@angular/core";
import { IngridShared } from "../../ingrid/doctypes/ingrid-shared";
import { FormControl } from "@angular/forms";

@Injectable({ providedIn: "root" })
export class CommonFieldsBaw extends FormFieldHelper {
  getOrderTitleFieldConfig(): FormlyFieldConfig {
    return this.addInput("orderTitle", "Auftragstitel", {
      required: true,
      wrappers: ["panel", "form-field"],
    });
  }

  getOrderNumberFieldConfig(): FormlyFieldConfig {
    return this.addInput("orderNumber", "Auftragsnummer", {
      required: true,
      wrappers: ["panel", "form-field"],
    });
  }

  getBAWKeywordCatalogueFieldConfig(doc: IngridShared): FormlyFieldConfig {
    return doc.addRepeatList("bawKeywords", "BAW - Schlagwortkatalog 2012", {
      asSelect: true,
      options: doc.getCodelistForSelect("3950005", "null"),
    });
  }

  addSharedFields(doc: IngridShared, fieldConfig: FormlyFieldConfig[]) {
    const keywordSectionPosition = this.findFieldElementWithId(
      fieldConfig,
      "pointOfContact",
    );

    // BAW Schlagwortkatalog
    this.addAfter(
      keywordSectionPosition,
      this.getBAWKeywordCatalogueFieldConfig(doc),
    );

    // Require reference to address 'Bundesanstalt für Wasserbau' as 'Ansprechpartner'
    const pointOfContact = doc.findFieldElementWithId(
      fieldConfig,
      "pointOfContact",
    );
    // TODO refactor to  this.addValidators(pointOfContact, [this.hasBAWPointOfContact]);
    pointOfContact.fieldConfig[pointOfContact.index].validators = {
      ...pointOfContact.fieldConfig[pointOfContact.index].validators,
      hasBAWPointOfContact: this.hasBAWPointOfContact,
    };
  }

  hasBAWPointOfContact = {
    expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
      // equals "Herausgeber"
      ctrl.value
        ? ctrl.value.some(
            // TODO: was address.institution (title) in ige classic. refactor or define reserved address.ref
            (address) =>
              address.type?.key === "7" &&
              address.ref === "481a36a4-3288-4d99-90a9-2814dd7af151",
          )
        : false,
    message:
      "Ein Eintrag für die Institution 'Bundesanstalt für Wasserbau' als 'Ansprechpartner' muss vorhanden sein",
  };

  hasPublicationDate = {
    expression: (ctrl: FormControl, field: FormlyFieldConfig) =>
      // equals "Publikation"
      ctrl.value
        ? ctrl.value.some((item) => item.referenceDateType?.key === "2")
        : false,
    message:
      "Es muss mindestens ein Datum vom Typ 'Publikation' vorhanden sein",
  };
}
