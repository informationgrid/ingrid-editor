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
import { Component, ChangeDetectionStrategy, inject } from "@angular/core";
import { NgxFlowModule } from "@flowjs/ngx-flow";
import { OpenDataComponent } from "./profile-opendata";
import { CodelistStore } from "../app/store/codelist/codelist.store";
import { toObservable } from "@angular/core/rxjs-interop";
import { filter, take } from "rxjs/operators";

@Component({
  template: "bmi",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgxFlowModule],
})
class BmiComponent extends OpenDataComponent {
  private codelistStore = inject(CodelistStore);
  private codelists$ = toObservable(this.codelistStore.entityMap);

  constructor() {
    super();
    this.reportsService.setFilter((route) => route.path != "url-check");
    this.opendata.options.spatialTypes = ["free", "wkt"];
    this.opendata.options.temporalLegacy = true;

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

export class ProfilePack {
  static getMyComponent() {
    return BmiComponent;
  }
}
