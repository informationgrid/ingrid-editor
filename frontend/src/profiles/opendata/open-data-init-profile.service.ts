/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
import { inject, Injectable } from "@angular/core";
import { CodelistStore } from "../../app/store/codelist/codelist.store";
import { PluginService } from "../../app/services/plugin/plugin.service";
import { BehaviourService } from "../../app/services/behavior/behaviour.service";
import { OpendataPlugin } from "./behaviours/opendata.plugin";
import { OpenDataDoctype } from "./doctypes/open-data.doctype";
import { toObservable } from "@angular/core/rxjs-interop";
import { filter, take } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class OpenDataInitProfile {
  private codelistStore = inject(CodelistStore);
  private pluginService = inject(PluginService);
  private behaviourService = inject(BehaviourService);
  private opendataPlugin = inject(OpendataPlugin);
  private opendata = inject(OpenDataDoctype);

  private codelists$ = toObservable(this.codelistStore.entityMap);

  initProfile() {
    // rename codelist entry (should be done in codelist repo!?)
    this.codelists$
      .pipe(
        filter((map) => map["505"] !== undefined),
        take(1),
      )
      .subscribe((data) => this.modifyAddressTypeCodelist(data));

    this.pluginService.registerPlugin(this.opendataPlugin);

    this.opendata.showOpendata = this.behaviourService
      .getBehaviour("plugin.opendata.flexibleDoctype")
      .isActive();
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
