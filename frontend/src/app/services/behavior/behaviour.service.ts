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
import { Injectable } from "@angular/core";
import { BehaviorDataService } from "./behavior-data.service";
import { tap } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PluginService } from "../plugin/plugin.service";
import { Plugin } from "../../+catalog/+behaviours/plugin";

export interface BehaviourFormatBackend {
  _id: string;
  active: boolean;
  data?: any;
}

export interface BehaviourRegistration {
  register: boolean;
  address: boolean;
}

@Injectable({
  providedIn: "root",
})
export class BehaviourService {
  constructor(
    private pluginService: PluginService,
    private dataService: BehaviorDataService,
    private snackBar: MatSnackBar,
  ) {}

  saveBehaviours(behaviours: BehaviourFormatBackend[]) {
    this.updateState(behaviours);
    this.dataService
      .saveBehaviors(behaviours)
      .pipe(
        tap(() => this.snackBar.open("Die Konfiguration wurde gespeichert")),
      )
      .subscribe();
  }

  getBehaviour(id: string) {
    return this.pluginService.plugins.find((plugin) => plugin.id === id);
  }

  private updateState(behaviours: BehaviourFormatBackend[]) {
    const activate: Plugin[] = [];
    const deactivate: Plugin[] = [];
    const update: Plugin[] = [];

    behaviours.forEach((behaviour) => {
      const found = this.pluginService.plugins.find(
        (plugin) => plugin.id === behaviour._id,
      );

      if (behaviour.active !== found.isActive) {
        behaviour.active ? activate.push(found) : deactivate.push(found);
      } else if (behaviour.active) {
        update.push(found);
      }
      found.isActive = behaviour.active;
      found.data = behaviour.data;
    });

    activate.forEach((a) => a.register());
    deactivate.forEach((a) => a.unregister());
    update.forEach((a) => a.update());
  }
}
