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
import { Injectable } from "@angular/core";
import { GeoServiceDoctype } from "../../ingrid/doctypes/geo-service.doctype";
import { SharedHmdk } from "./shared-hmdk";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class GeoServiceDoctypeHmdk extends GeoServiceDoctype {
  sharedHmdk = new SharedHmdk(this);

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    return this.sharedHmdk.manipulateDocumentFields(fieldConfig);
  };

  handleActivateOpenData(field: FormlyFieldConfig) {
    return this.sharedHmdk.hmdkHandleActivateOpenData(
      super.handleActivateOpenData(field),
    );
    return super.handleActivateOpenData(field).pipe(
      map((execute) => {
        if (execute) this.sharedHmdk.hmdkHandleActivateOpenData(field);
        return execute;
      }),
    );
  }

  handleDeactivateOpenData(field: FormlyFieldConfig) {
    return super.handleDeactivateOpenData(field).pipe(
      map((execute) => {
        if (execute) this.sharedHmdk.hmdkHandleDeactivateOpenData(field);
        return execute;
      }),
    );
  }

  handleActivateInspireIdentified(field: FormlyFieldConfig) {
    return super.handleActivateInspireIdentified(field).pipe(
      map((execute) => {
        if (execute) this.sharedHmdk.hmdkHandleActivateInspireIdentified(field);
        return execute;
      }),
    );
  }
}
