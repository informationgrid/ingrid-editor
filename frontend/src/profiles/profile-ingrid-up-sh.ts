/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { GeoDatasetDoctypeUPSH } from "./ingrid-up-sh/doctypes/geo-dataset.doctype";

@Component({
  template: "",
})
class InGridUPSHComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeUPSH);
}

@NgModule({
  declarations: [InGridUPSHComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridUPSHComponent;
  }
}
