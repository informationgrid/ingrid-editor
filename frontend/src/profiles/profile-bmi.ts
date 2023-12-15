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
import { BmiDoctype } from "./bmi/bmi.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { ContextHelpService } from "../app/services/context-help/context-help.service";
import { BmiAddressDoctype } from "./bmi/bmi-address.doctype";
import { NgxFlowModule } from "@flowjs/ngx-flow";
import { ReportsService } from "../app/+reports/reports.service";

@Component({
  template: "",
})
class BmiComponent {
  constructor(
    service: ProfileService,
    contextHelpService: ContextHelpService,
    reportsService: ReportsService,
    bmi: BmiDoctype,
    folder: FolderDoctype,
    bmiAddress: BmiAddressDoctype,
  ) {
    const types = [bmi, folder, bmiAddress];

    service.registerProfiles(types);

    reportsService.setFilter((route) => route.path != "url-check");
  }
}

@NgModule({
  declarations: [BmiComponent],
  imports: [NgxFlowModule],
})
export class ProfilePack {
  static getMyComponent() {
    return BmiComponent;
  }
}
