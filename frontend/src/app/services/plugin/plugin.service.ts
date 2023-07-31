import { Injectable } from "@angular/core";
import { Plugin } from "../../+catalog/+behaviours/plugin";
import {
  BehaviourFormatBackend,
  BehaviourRegistration,
} from "../behavior/behaviour.service";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../config/config.service";

@Injectable({
  providedIn: "root",
})
export class PluginService {
  pluginState$ = new Subject<BehaviourRegistration>();

  plugins: Plugin[] = [];

  backendBehaviourStates: BehaviourFormatBackend[];

  initWithAddress: boolean = null;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.backendBehaviourStates = configService.$userInfo.value.plugins;

    this.pluginState$.subscribe((value) =>
      value.register
        ? this.initFormPlugins(value.address)
        : this.unregisterFormPlugins()
    );
  }

  registerPlugin(plugin: Plugin) {
    this.applyActiveStates([plugin]);
    this.plugins.push(plugin);

    if (plugin.isActive) {
      plugin.register();

      // register late plugins, which were not ready during initialization
      if (this.initWithAddress !== null) {
        if (
          !this.initWithAddress ||
          (this.initWithAddress && !plugin.hideInAddress)
        ) {
          plugin.registerForm();
        }
      }
    }
  }

  private initFormPlugins(forAddress: boolean) {
    this.initWithAddress = forAddress;

    this.plugins
      .filter((p) => p.isActive)
      .filter((p) => !forAddress || (forAddress && !p.hideInAddress))
      .forEach((p) => p.registerForm());
  }

  private unregisterFormPlugins() {
    return this.plugins.forEach((plugin) => plugin.unregisterForm());
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
