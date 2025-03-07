/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { FolderDoctype } from "./folder/folder.doctype";
import { ProfileService } from "../app/services/profile.service";
import { ReportsService } from "../app/+reports/reports.service";
import { OpenDataDoctype } from "./opendata/doctypes/open-data.doctype";
import { OpenDataAddressDoctype } from "./opendata/doctypes/open-data-address.doctype";
import { CodelistStore } from "../app/store/codelist/codelist.store";
import { filter, take } from "rxjs/operators";
import { toObservable } from "@angular/core/rxjs-interop";

@Component({
  template: "",
  standalone: true,
})
export class OpenDataComponent {
  private codelistStore = inject(CodelistStore);

  private codelists$ = toObservable(this.codelistStore.entityMap);

  // TODO: bmiChange = (inject(BmiDoctype).codelistIdOpenData = "6400");
  constructor(
    service: ProfileService,
    // contextHelpService: ContextHelpService,
    reportsService: ReportsService,
    opendata: OpenDataDoctype,
    folder: FolderDoctype,
    opendataAddress: OpenDataAddressDoctype,
    // isoViewPlugin: IsoViewPlugin,
  ) {
    const types = [opendata, folder, opendataAddress];

    service.registerDoctypes(types);

    reportsService.setFilter((route) => route.path != "url-check");
    // rename codelist entry (should be done in codelist repo!?)
    this.codelists$
      .pipe(
        filter((map) => map["505"] !== undefined),
        take(1),
      )
      .subscribe((data) => this.modifyAddressTypeCodelist(data));
  }

  private modifyAddressTypeCodelist(data) {
    const modified505 = {
      ...data["505"],
      entries: data["505"].entries.map((item) =>
        item.id === "10"
          ? {
              ...item,
              fields: { ...item.fields, de: "Veröffentlichende Stelle" },
            }
          : item,
      ),
    };
    this.codelistStore.updateCodelist(modified505);
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
