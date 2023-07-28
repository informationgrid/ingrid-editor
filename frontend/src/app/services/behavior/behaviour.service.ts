import { Injectable } from "@angular/core";
import { BehaviorDataService } from "./behavior-data.service";
import { ConfigService } from "../config/config.service";
import { Behaviour } from "./behaviour";
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
  behaviours: Behaviour[] = [];

  // registerState$ = new Subject<BehaviourRegistration>();

  // theSystemBehaviours$ = new BehaviorSubject<Plugin[]>([]);
  backendBehaviourStates: BehaviourFormatBackend[];

  constructor(
    private configService: ConfigService,
    private pluginService: PluginService,
    private dataService: BehaviorDataService,
    private toast: MatSnackBar
  ) {
    /*this.loadStoredBehaviours()
      .pipe(
        tap((backendBehaviours) =>
          console.log("backendBehaviours: ", backendBehaviours)
        )
        // tap(() => this.theSystemBehaviours$.next(this.pluginService))
      )
      .subscribe();*/
  }

  /*
  loadStoredBehaviours(): Observable<any> {
    return this.dataService.loadStoredBehaviours().pipe(
      tap((storedBehaviours) =>
        console.log(`fetched behaviours`, storedBehaviours)
      ),
      tap(
        (storedBehaviours) => (this.backendBehaviourStates = storedBehaviours)
      ),
      // tap(() => this.applyActiveStates(this.systemBehaviours)),
      catchError((e) => {
        const userInfo = this.configService.$userInfo.value;
        console.error("Could not get behaviours");
        if (userInfo?.assignedCatalogs?.length === 0) {
          console.log("because of user with no assigned catalogs");
          return [];
        } else {
          throw e;
        }
      })
    );
  }
*/

  /*
  applyActiveStates(behaviours: Plugin2[]) {
    behaviours.forEach((behaviour) => {
      const stored = this.backendBehaviourStates
        ? this.backendBehaviourStates.filter(
            (sb: any) => sb._id === behaviour.id
          )
        : [];
      behaviour.isActive =
        stored.length > 0 ? stored[0].active : behaviour.defaultActive;
      behaviour.data = stored.length > 0 ? stored[0].data : null;
    });
  }
*/

  /*
    registerActiveBehaviours() {
      this.systemBehaviours
        .filter((systemBehaviour) => systemBehaviour.isActive)
        .forEach((systemBehaviour) => {
          console.log("register system behaviour: " + systemBehaviour.name);
          systemBehaviour.register();
        });
    }
  */

  saveBehaviours(behaviours: BehaviourFormatBackend[]) {
    this.updateState(behaviours);
    this.dataService
      .saveBehaviors(behaviours)
      .pipe(tap(() => this.toast.open("Die Konfiguration wurde gespeichert")))
      .subscribe();
  }

  /*addSystemBehaviourFromProfile(plugin: Plugin) {
    this.applyActiveStates([plugin]);
    this.systemBehaviours.push(plugin);
  }*/

  getBehaviour(id: string) {
    return this.pluginService.plugins.find((plugin) => plugin.id === id);
  }

  private updateState(behaviours: BehaviourFormatBackend[]) {
    const activate: Plugin[] = [];
    const deactivate: Plugin[] = [];
    const update: Plugin[] = [];

    behaviours.forEach((behaviour) => {
      const found = this.pluginService.plugins.find(
        (plugin) => plugin.id === behaviour._id
      );
      // skip form plugins
      /*if (!found) {
        this.handleFormBehaviour(behaviour);
        return;
      }*/

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

    // this.theSystemBehaviours$.next(this.systemBehaviours);
  }

  /*
  private handleFormBehaviour(behaviour: BehaviourFormatBackend) {
    const found = this.backendBehaviourStates.find(
      (backendBehaviour) => backendBehaviour._id === behaviour._id
    );
    if (!found) {
      this.backendBehaviourStates.push(behaviour);
      return;
    }
    found.active = behaviour.active;
    found.data = behaviour.data;
  }
*/
}
