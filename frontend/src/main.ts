import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {hmrBootstrap} from './hmr';
import {enableAkitaProdMode, persistState} from '@datorama/akita';

if (environment.production) {
  enableProdMode();
  enableAkitaProdMode()
}

persistState({
  include: ['session'],
  preStorageUpdate: (storeName: string, state: any) => ({ui: state.ui, recentAddresses: state.recentAddresses})
});

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (environment.hmr) {
  if (module[ 'hot' ]) {
    hmrBootstrap(module, bootstrap);
  } else {
    console.error('HMR is not enabled for webpack-dev-server!');
    console.log('Are you using the --hmr flag for ng serve?');
  }
} else {
  bootstrap();
}
