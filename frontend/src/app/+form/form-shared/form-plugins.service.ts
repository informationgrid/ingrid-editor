import {Inject, Injectable, OnDestroy} from '@angular/core';
import {Plugin} from '../../+catalog/+behaviours/plugin';
import {FormPluginToken} from '../../tokens/plugin.token';
import {Router} from '@angular/router';

// TODO: Add Angular decorator.
@Injectable()
export class FormPluginsService implements OnDestroy {

  plugins: Plugin[] = [];

  constructor(@Inject(FormPluginToken) autoPlugins: Plugin[], router: Router) {

    const forAddress = router.url.indexOf('/address') !== -1;

    this.plugins.push(...autoPlugins);

    if (forAddress) {
      this.plugins.forEach(p => p.setForAddress());
    }
    this.plugins.forEach(p => p.register());

    // TODO: handle configuration for addresses or documents
  }

  ngOnDestroy(): void {
    this.plugins.forEach(p => p.unregister());
  }

}
