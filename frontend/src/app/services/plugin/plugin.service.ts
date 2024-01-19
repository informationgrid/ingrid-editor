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
import { Plugin } from "../../+catalog/+behaviours/plugin";
import {
  BehaviourFormatBackend,
  BehaviourRegistration,
} from "../behavior/behaviour.service";
import { Subject } from "rxjs";
import { ConfigService } from "../config/config.service";

@Injectable({
  providedIn: "root",
})
export class PluginService {
  pluginState$ = new Subject<BehaviourRegistration>();

  plugins: Plugin[] = [];

  backendBehaviourStates: BehaviourFormatBackend[];

  initWithAddress: boolean = null;

  registeredForms: { [x: string]: boolean } = {};

  constructor(configService: ConfigService) {
    this.backendBehaviourStates = configService.$userInfo.value.plugins;

    this.pluginState$.subscribe((value) =>
      value.register
        ? this.initFormPlugins(value.address)
        : this.unregisterFormPlugins(),
    );
  }

  registerPlugin(plugin: Plugin) {
    this.applyActiveStates([plugin]);
    this.plugins.push(plugin);

    if (plugin.isActive) {
      plugin.register();

      // register late plugins, which were not ready during initialization
      // only activate those form plugins which belong to the form (data/address)
      if (
        this.initWithAddress !== null &&
        (!this.initWithAddress || !plugin.hideInAddress)
      ) {
        this.registerForm(plugin);
      }
    }
  }

  private registerForm(plugin: Plugin) {
    const alreadyRegistered = this.registeredForms[plugin.id] === true;

    if (!alreadyRegistered) {
      this.registeredForms[plugin.id] = true;
      plugin.registerForm();
    } else {
      console.warn(`Already registered form-plugin: ${plugin.id} => Skipping`);
    }
  }

  private initFormPlugins(forAddress: boolean) {
    this.plugins.forEach((p) => p.setForAddress(forAddress));

    this.plugins
      .filter((p) => p.isActive)
      .filter((p) => !forAddress || !p.hideInAddress)
      .forEach((p) => this.registerForm(p));

    this.initWithAddress = forAddress;
  }

  private unregisterFormPlugins() {
    return this.plugins.forEach((plugin) => this.unregisterForm(plugin));
  }

  private unregisterForm(plugin: Plugin) {
    this.registeredForms[plugin.id] = false;
    plugin.unregisterForm();
  }

  applyActiveStates(behaviours: Plugin[]) {
    behaviours.forEach((behaviour) => {
      const stored = this.backendBehaviourStates
        ? this.backendBehaviourStates.filter(
            (sb: any) => sb._id === behaviour.id,
          )
        : [];
      behaviour.isActive =
        stored.length > 0 ? stored[0].active : behaviour.defaultActive;
      behaviour.data = stored.length > 0 ? stored[0].data : null;
    });
  }
}
