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
import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { GeoDatasetDoctypeHMDK } from "./hmdk/doctypes/geo-dataset.doctype";
import { SharedHmdk } from "./hmdk/doctypes/shared-hmdk";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { map } from "rxjs/operators";

@Component({
  template: "",
})
class InGridHMDKComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeHMDK);
  sharedHmdk = inject(SharedHmdk);

  constructor() {
    super();

    this.modifyFormFieldConfiguration();
  }

  private modifyFormFieldConfiguration() {
    [
      this.specialisedTask,
      this.geoDataset,
      this.literature,
      this.geoService,
      this.project,
      this.dataCollection,
      this.informationSystem,
    ].forEach((docType) => {
      docType.manipulateDocumentFields =
        this.sharedHmdk.manipulateDocumentFields;

      const temp = docType.handleActivateOpenData;
      docType.handleActivateOpenData = (field: FormlyFieldConfig) => {
        return temp(field).pipe(
          map((execute) => {
            if (execute) this.sharedHmdk.hmdkHandleDeactivateOpenData(field);
            return execute;
          }),
        );
      };

      // show open data categories for all doctypes.
      docType.showOpenDataCategories = "false";
      docType.requiredOpenDataCategories = "false";
      docType.dynamicRequiredOpenDataCategories = "false";
      docType.options.dynamicHide.hideOpenDataCategories = "false";
      docType.options.dynamicRequired.openDataCategories =
        "formState.mainModel?.isOpenData || formState.mainModel?.publicationHmbTG";
    });
  }
}

@NgModule({
  declarations: [InGridHMDKComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridHMDKComponent;
  }
}
