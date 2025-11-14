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
import { FormlyFieldConfig } from "@ngx-formly/core";
import { inject, Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";
import { CommonFieldsBast } from "./common-fields";
import { IngridShared } from "../../ingrid/doctypes/ingrid-shared";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctypeBast extends GeoDatasetDoctype {
  common = inject(CommonFieldsBast);

  showAdVCompatible = false;
  showAdVProductGroup = false;
  showIdentifierCreateButton = false;

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    const section = this.findSectionWithLabel(fieldConfig, "Allgemeines");
    section.fieldGroup.push(...this.common.getFields());

    const useConstraints = IngridShared.findFieldElementWithId(
      fieldConfig,
      "useConstraints",
    );
    this.addAfter(
      useConstraints,
      this.common.getUseConstraintsCommentsFieldConfig(),
    );

    // do not set default value for temporal data since it's required
    const temporalData = IngridShared.findFieldElementWithId(
      fieldConfig,
      "data",
      "temporal",
    );
    temporalData.field.defaultValue = undefined;

    return fieldConfig;
  };
}
