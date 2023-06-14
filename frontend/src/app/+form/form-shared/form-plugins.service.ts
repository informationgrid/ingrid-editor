import { Injectable } from "@angular/core";
import { Plugin } from "../../+catalog/+behaviours/plugin";
import { Router } from "@angular/router";
import { BehaviourService } from "../../services/behavior/behaviour.service";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class FormPluginsService {
  plugins: Plugin[] = [];
  // private registered = false;

  constructor(private behaviourService: BehaviourService, router: Router) {
    const forAddress = router.url.indexOf("/address") !== -1;

    behaviourService.registerState$
      .pipe(filter((value) => value.address === forAddress))
      .subscribe((value) =>
        value.register ? this.init(forAddress) : this.unregisterAll()
      );
  }

  registerPlugin(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  private init(forAddress: boolean) {
    // if (this.registered) return;

    this.behaviourService.applyActiveStates(this.plugins);

    if (forAddress) {
      this.plugins.forEach((p) => p.setForAddress());
    }

    this.plugins
      .filter((p) => p.isActive)
      .filter((p) => !forAddress || (forAddress && !p.hideInAddress))
      .forEach((p) => p.register());

    // this.registered = true;
  }

  // on destroy must be called manually from provided component since it may not be
  // called always
  onDestroy(): void {
    this.unregisterAll();
  }

  private unregisterAll() {
    this.plugins.forEach((p) => p.unregister());
    // this.registered = false;
  }
}
