import { Inject, Injectable } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { Plugin } from "../../+catalog/+behaviours/plugin";
import { ProfileService } from "../profile.service";
import { BehaviorSubject, Observable } from "rxjs";
import { BehaviorDataService } from "./behavior-data.service";
import { ProfileQuery } from "../../store/profile/profile.query";
import { SessionQuery } from "../../store/session.query";
import { PluginToken } from "../../tokens/plugin.token";
import { ConfigService } from "../config/config.service";
import { Behaviour } from "./behaviour";
import { catchError, tap } from "rxjs/operators";

export interface BehaviourFormatBackend {
  _id: string;
  active: boolean;
  data?: any;
}

@Injectable({
  providedIn: "root",
})
export class BehaviourService {
  behaviours: Behaviour[] = [];

  theSystemBehaviours$ = new BehaviorSubject<Plugin[]>([]);
  backendBehaviourStates: BehaviourFormatBackend[];

  constructor(
    private eventManager: EventManager,
    private configService: ConfigService,
    private profileService: ProfileService,
    private profileQuery: ProfileQuery,
    private sessionQuery: SessionQuery,
    @Inject(PluginToken) private systemBehaviours: Plugin[],
    private dataService: BehaviorDataService
  ) {
    this.loadStoredBehaviours()
      .pipe(
        tap((backendBehaviours) =>
          console.log("backendBehaviours: ", backendBehaviours)
        ),
        tap(() => this.theSystemBehaviours$.next(this.systemBehaviours))
      )
      .subscribe(() => this.registerActiveBehaviours());
  }

  loadStoredBehaviours(): Observable<any> {
    return this.dataService.loadStoredBehaviours().pipe(
      tap((storedBehaviours) =>
        console.log(`fetched behaviours`, storedBehaviours)
      ),
      tap(
        (storedBehaviours) => (this.backendBehaviourStates = storedBehaviours)
      ),
      tap(() => this.applyActiveStates(this.systemBehaviours)),
      catchError((e) => {
        const userInfo = this.configService.$userInfo.value;
        console.error("Could not get behaviours");
        if (userInfo.assignedCatalogs.length === 0) {
          console.log("because of user with no assigned catalogs");
          return [];
        } else {
          throw e;
        }
      })
    );
  }

  applyActiveStates(behaviours: Plugin[]) {
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

  registerActiveBehaviours() {
    this.systemBehaviours
      .filter((systemBehaviour) => systemBehaviour.isActive)
      .forEach((systemBehaviour) => {
        console.log("register system behaviour: " + systemBehaviour.name);
        systemBehaviour.register();
      });
  }

  saveBehaviours(behaviours: BehaviourFormatBackend[]) {
    this.updateState(behaviours);
    this.dataService.saveBehaviors(behaviours).subscribe();
  }

  private updateState(behaviours: BehaviourFormatBackend[]) {
    const activate: Plugin[] = [];
    const deactivate: Plugin[] = [];
    const update: Plugin[] = [];

    behaviours.forEach((behaviour) => {
      const found = this.systemBehaviours.find(
        (sysBehaviour) => sysBehaviour.id === behaviour._id
      );
      // skip form plugins
      if (!found) {
        this.handleFormBehaviour(behaviour);
        return;
      }

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

    this.theSystemBehaviours$.next(this.systemBehaviours);
  }

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
}
