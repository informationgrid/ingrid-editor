import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {KeycloakService} from './app/keycloak/keycloak.service';
import {KeycloakMockService} from './app/keycloak/keycloak-mock.service';

if (environment.production) {
  enableProdMode();
}

const keycloakService = environment.mockKeycloak ? KeycloakMockService : KeycloakService;

keycloakService.init()
  .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
  .catch(e => window.location.reload() );
