import { Injectable } from "@angular/core";
import { Plugin } from "../../+catalog/+behaviours/plugin";
import { BehaviourService } from "../../services/behavior/behaviour.service";

@Injectable({
  providedIn: "root",
})
export class FormPluginsService {
  plugins: Plugin[] = [];

  constructor(private behaviourService: BehaviourService) {
    behaviourService.registerState$.subscribe((value) =>
      value.register ? this.init(value.address) : this.unregisterAll()
    );
  }

  registerPlugin(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  private init(forAddress: boolean) {
    this.behaviourService.applyActiveStates(this.plugins);

    this.plugins.forEach((p) => p.setForAddress(forAddress));

    this.plugins
      .filter((p) => p.isActive)
      .filter((p) => !forAddress || (forAddress && !p.hideInAddress))
      .forEach((p) => p.register());
  }

  // on destroy must be called manually from provided component since it may not be
  // called always
  onDestroy(): void {
    this.unregisterAll();
  }

  private unregisterAll() {
    this.plugins.forEach((p) => p.unregister());
  }
}
