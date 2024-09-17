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
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { NgxFlowModule } from "@flowjs/ngx-flow";
import { ReportsService } from "../app/+reports/reports.service";
import { OpenDataComponent } from "./profile-opendata";
import { OpenDataAddressDoctype } from "./opendata/doctypes/open-data-address.doctype";
import { OpenDataDoctype } from "./opendata/doctypes/open-data.doctype";
import { CodelistStore } from "../app/store/codelist/codelist.store";
import { CodelistQuery } from "../app/store/codelist/codelist.query";

@Component({
  template: "",
  standalone: true,
})
class BmiComponent extends OpenDataComponent {
  constructor(
    service: ProfileService,
    reportsService: ReportsService,
    dataset: OpenDataDoctype,
    folder: FolderDoctype,
    address: OpenDataAddressDoctype,
    codelistStore: CodelistStore,
    codelistQuery: CodelistQuery,
  ) {
    super(
      service,
      reportsService,
      dataset,
      folder,
      address,
      codelistStore,
      codelistQuery,
    );
    reportsService.setFilter((route) => route.path != "url-check");
  }
}

@NgModule({
  imports: [NgxFlowModule, BmiComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return BmiComponent;
  }
}
