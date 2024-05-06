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
import { Component, NgModule } from "@angular/core";
import { FolderDoctype } from "./folder/folder.doctype";
import { ProfileService } from "../app/services/profile.service";
import { ContextHelpService } from "../app/services/context-help/context-help.service";
import { ReportsService } from "../app/+reports/reports.service";
import { OpenDataDoctype } from "./opendata/doctypes/open-data.doctype";
import { OpenDataAddressDoctype } from "./opendata/doctypes/open-data-address.doctype";

@Component({
  template: "",
})
class OpenDataComponent {
  // TODO: bmiChange = (inject(BmiDoctype).codelistIdOpenData = "6400");
  constructor(
    service: ProfileService,
    contextHelpService: ContextHelpService,
    reportsService: ReportsService,
    opendata: OpenDataDoctype,
    folder: FolderDoctype,
    opendataAddress: OpenDataAddressDoctype,
  ) {
    const types = [opendata, folder, opendataAddress];

    service.registerProfiles(types);

    reportsService.setFilter((route) => route.path != "url-check");
  }
}

@NgModule({
  declarations: [OpenDataComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return OpenDataComponent;
  }
}
