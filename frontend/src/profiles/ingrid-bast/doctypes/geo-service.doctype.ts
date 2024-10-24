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
import { GeoServiceDoctype } from "../../ingrid/doctypes/geo-service.doctype";
import { CommonFieldsBast } from "./common-fields";

@Injectable({
  providedIn: "root",
})
export class GeoServiceDoctypeBast extends GeoServiceDoctype {
  common = inject(CommonFieldsBast);

  defaultKeySpatialScope = "-673152846";
  showAdVCompatible = false;
  showAdVProductGroup = false;

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    fieldConfig[1].fieldGroup
      .find((field) => field.props.label === "Allgemeines")
      .fieldGroup.push(...this.common.getFields());

    fieldConfig[7].fieldGroup[0].fieldGroup.splice(
      2,
      0,
      this.common.getUseConstraintsCommentsFieldConfig(),
    );

    return fieldConfig;
  };
}
