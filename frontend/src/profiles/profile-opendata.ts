/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Component, inject } from "@angular/core";
import { FolderDoctype } from "./folder/folder.doctype";
import { ProfileService } from "../app/services/profile.service";
import { ReportsService } from "../app/+reports/reports.service";
import { OpenDataDoctype } from "./opendata/doctypes/open-data.doctype";
import { OpenDataAddressDoctype } from "./opendata/doctypes/open-data-address.doctype";
import { OpenDataInitProfile } from "./opendata/open-data-init-profile.service";

@Component({
  template: "",
  standalone: true,
})
export class OpenDataComponent {
  private profileService = inject(ProfileService);
  protected reportsService = inject(ReportsService);
  protected opendata = inject(OpenDataDoctype);
  private folder = inject(FolderDoctype);
  private opendataAddress = inject(OpenDataAddressDoctype);
  private init = inject(OpenDataInitProfile);

  // TODO: bmiChange = (inject(BmiDoctype).codelistIdOpenData = "6400");
  constructor() {
    const types = [this.opendata, this.folder, this.opendataAddress];

    this.profileService.registerDoctypes(types);

    this.reportsService.setFilter((route) => route.path != "url-check");

    this.init.initProfile();
  }
}

export class ProfilePack {
  static getMyComponent() {
    return OpenDataComponent;
  }
}
