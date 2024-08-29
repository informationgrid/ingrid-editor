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
import { ReportsService } from "../app/+reports/reports.service";
import { OpenDataDoctype } from "./opendata/doctypes/open-data.doctype";
import { OpenDataAddressDoctype } from "./opendata/doctypes/open-data-address.doctype";
import { CodelistStore } from "../app/store/codelist/codelist.store";
import { CodelistQuery } from "../app/store/codelist/codelist.query";
import { filter, take } from "rxjs/operators";
import { arrayUpdate } from "@datorama/akita";

@Component({
  template: "",
  standalone: true,
})
class OpenDataComponent {
  // TODO: bmiChange = (inject(BmiDoctype).codelistIdOpenData = "6400");
  constructor(
    service: ProfileService,
    // contextHelpService: ContextHelpService,
    reportsService: ReportsService,
    opendata: OpenDataDoctype,
    folder: FolderDoctype,
    opendataAddress: OpenDataAddressDoctype,
    codelistStore: CodelistStore,
    codelistQuery: CodelistQuery,
    // isoViewPlugin: IsoViewPlugin,
  ) {
    const types = [opendata, folder, opendataAddress];

    service.registerProfiles(types);

    reportsService.setFilter((route) => route.path != "url-check");

    // rename codelist entry (should be done in codelist repo!?)
    codelistQuery
      .selectEntity("505")
      .pipe(
        filter((data) => data !== undefined),
        take(1),
      )
      .subscribe((data) => {
        const contact = data.entries.filter((item) => item.id === "12")[0];
        const clonedContact = JSON.parse(JSON.stringify(contact));
        clonedContact.fields.de = "Veröffentlichende Stelle";
        codelistStore.update("505", ({ entries }) => ({
          entries: arrayUpdate(entries, "12", clonedContact),
        }));
      });
  }
}

@NgModule({
  imports: [OpenDataComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return OpenDataComponent;
  }
}
