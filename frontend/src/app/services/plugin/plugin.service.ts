import { Injectable } from "@angular/core";
import { Plugin2 } from "../../+catalog/+behaviours/plugin2";
import {
  BehaviourFormatBackend,
  BehaviourRegistration,
} from "../behavior/behaviour.service";
import { Observable, Subject } from "rxjs";
import { Plugin } from "../../+catalog/+behaviours/plugin";
import { catchError, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../config/config.service";

@Injectable({
  providedIn: "root",
})
export class PluginService {
  pluginState$ = new Subject<BehaviourRegistration>();

  plugins: Plugin2[] = [];

  backendBehaviourStates: BehaviourFormatBackend[];

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.loadStoredBehaviours();

    this.pluginState$.subscribe((value) =>
      value.register
        ? this.initFormPlugins(value.address)
        : this.unregisterFormPlugins()
    );
  }

  registerPlugin(plugin: Plugin2) {
    this.plugins.push(plugin);

    plugin.register();

    // register late plugins, which were not ready during initialization
    // if (this.initWithAddress !== null) {
    //   this.init([plugin], this.initWithAddress);
    // }
  }

  private initFormPlugins(forAddress: boolean) {
    // this.initWithAddress = forAddress;
    this.applyActiveStates(this.plugins);

    this.plugins
      .filter((p) => p.isActive)
      .filter((p) => !forAddress || (forAddress && !p.hideInAddress))
      .forEach((p) => p.registerForm());
  }

  private unregisterFormPlugins() {
    return this.plugins.forEach((plugin) => plugin.unregisterForm());
  }

  loadStoredBehaviours(): Observable<any> {
    return this.http
      .get<any[]>(
        this.configService.getConfiguration().backendUrl + "behaviours"
      )
      .pipe(
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
}
