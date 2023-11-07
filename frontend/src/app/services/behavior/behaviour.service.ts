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
      .pipe(tap(() => this.snackBar.open("Die Konfiguration wurde gespeichert")))
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
