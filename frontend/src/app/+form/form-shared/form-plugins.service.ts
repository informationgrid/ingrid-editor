import {Inject, Injectable, OnDestroy} from '@angular/core';
import {Plugin} from '../../+catalog/+behaviours/plugin';
import {FormPluginToken} from '../../tokens/plugin.token';

@Injectable()
export class FormPluginsService implements OnDestroy {

  private plugins: Plugin[] = [];

  constructor(@Inject(FormPluginToken) autoPlugins: Plugin[]) {

    this.plugins.push(...autoPlugins);
    this.plugins.forEach(p => p.register());

    // TODO: handle configuration for addresses or documents
  }

  ngOnDestroy(): void {
    this.plugins.forEach(p => p.unregister());
  }

  setAddressConfiguration() {
    this.plugins.forEach(p => p.setForAddress());
  }

}
