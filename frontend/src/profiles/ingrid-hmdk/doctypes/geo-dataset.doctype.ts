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
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";
import { SharedHmdk } from "./shared-hmdk";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctypeHMDK extends GeoDatasetDoctype {
  private sharedHmdk = inject(SharedHmdk);

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    return this.sharedHmdk.manipulateDocumentFields(this, fieldConfig);
  };

  handleActivateOpenData(field: FormlyFieldConfig) {
    return this.sharedHmdk.hmdkHandleActivateOpenData(
      field,
      super.handleActivateOpenData(field),
    );
  }

  handleDeactivateOpenData(field: FormlyFieldConfig) {
    return this.sharedHmdk.hmdkHandleDeactivateOpenData(field);
  }

  handleActivateInspireIdentified(field: FormlyFieldConfig) {
    super.handleActivateInspireIdentified(field);
    this.sharedHmdk.hmdkHandleActivateInspireIdentified(field);
  }
}
