import {Inject, Injectable} from '@angular/core';
import {Plugin} from '../../+catalog/+behaviours/plugin';
import {Router} from '@angular/router';
import {BehaviourService} from '../../services/behavior/behaviour.service';
import {FormPluginToken} from '../../tokens/plugin.token';

@Injectable()
export class FormPluginsService {

  plugins: Plugin[] = [];

  constructor(behaviourService: BehaviourService, @Inject(FormPluginToken) autoPlugins: Plugin[], router: Router) {

    const forAddress = router.url.indexOf('/address') !== -1;

    behaviourService.applyActiveStates(autoPlugins);
    this.plugins.push(...autoPlugins);

    if (forAddress) {
      this.plugins.forEach(p => p.setForAddress());
    }

    this.plugins
      .filter(p => p.isActive)
      .forEach(p => p.register());

  }

  // on destroy must be called manually from provided component since it may not be
  // called always
  onDestroy(): void {
    this.plugins.forEach(p => p.unregister());
  }

}
