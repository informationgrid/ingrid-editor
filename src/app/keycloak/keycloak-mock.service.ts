import {Injectable} from '@angular/core';

import {environment} from '../../environments/environment';
import {AuthInfo, KeycloakAuthData, KeycloakService} from './keycloak.service';

declare let Keycloak: any;

const mockToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ1N2tJODdXNDhydjJ3WlFBOUNxVWY2d1p6bnh3R1pHUldmYjE4c' +
  'lFicWFnIn0.eyJqdGkiOiJjZjRkZTQxMi04NGMzLTRjZWEtYWNmYS00NGVjMjU5ZGJlYjYiLCJleHAiOjE0OTkxODUxNDQsIm5iZiI6MCwiaWF0IjoxND' +
  'k5MTg0ODQ0LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9yZWFsbXMvSW5HcmlkIiwiYXVkIjoiaWdlLW5nIiwic3ViIjoiY2ExNzMyNjY' +
  'tOWQxNC00MWRiLWFkOWMtMzcxZDBhNWJhZGU4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiaWdlLW5nIiwibm9uY2UiOiJkNDBmNTY1Yi05MTFhLTRjZWYt' +
  'YTgzZi0xMjZhYTY3MWQyODkiLCJhdXRoX3RpbWUiOjE0OTkxODQ4NDQsInNlc3Npb25fc3RhdGUiOiJjMmNmYmRhYi0yMDQ4LTQ5YzctOTI0Ny01MGQ0O' +
  'GEwYTExYTgiLCJhY3IiOiIxIiwiY2xpZW50X3Nlc3Npb24iOiJlMmI1NTI1OS1iOTgzLTQyODMtOGZmNS0yY2QzNDdhNDdiZjciLCJhbGxvd2VkLW9yaW' +
  'dpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InJ' +
  'lYWxtLW1hbmFnZW1lbnQiOnsicm9sZXMiOlsibWFuYWdlLXJlYWxtIiwibWFuYWdlLXVzZXJzIl19LCJpZ2UtbmciOnsicm9sZXMiOlsiYWRtaW4iXX0s' +
  'ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sIm5hbWUiOiJIZ' +
  'XJiZXJ0IExhbmRtYW5uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiaWdlIiwiZ2l2ZW5fbmFtZSI6IkhlcmJlcnQiLCJmYW1pbHlfbmFtZSI6IkxhbmRtYW' +
  '5uIn0.ioTnSWNzYc84dJXr86JHGSk1WUDbq22pLaSAQEdTXTgc1BLrJ-J_hnuYoLYQoh8LkYODgFwIKbu8MnV0Qebrt8vQ-oWw-b_Euh6-b6nTGtRcN0s' +
  'aXFL81hAJaQ3TgKMFIYWwYsjlI-VchPNqZM_HuoEWaJ-XkHS4jTdOc9PJE5xQV0R-mAVo9rBzM-bDM8bhRfauIxZvYt6Q6YCYkJtLcmsq5HG7bolGnv8L' +
  'fDjUtjU9NV6z1llv64CFBn8AvjiHbBJs9BqQ3wFwBruuGwvVmTIIjVBmmFU-eV2fkvZFYtTDfwIecj8jo3n24MKtc2uupAHkwkaKfMpaETyOR26rrw';

@Injectable()
export class KeycloakMockService {
  static auth: AuthInfo = {};

  static init(): Promise<any> {

    const keycloakAuth: KeycloakAuthData = {
      url: environment.keykloakBaseUrl,
      realm: 'InGrid',
      clientId: 'ige-ng',
      authServerUrl: '',
      resourceAccess: {
        'ige-ng': {
          roles: []
        }
      },
      init: () => {},
      updateToken: () => {}
    };

    return new Promise( (resolve, reject) => {
      KeycloakService.auth.loggedIn = true;
      KeycloakService.auth.authz = keycloakAuth;
      // will be initialized later
      KeycloakService.auth.roleMapping = [];
      KeycloakService.auth.logoutUrl = keycloakAuth.authServerUrl
        + 'realms/' + keycloakAuth.realm + '/protocol/openid-connect/logout?redirect_uri='
        + document.baseURI;
      KeycloakService.prototype.getToken = () => {
        return new Promise<string>( (resolve: any) => {
          resolve( mockToken );
        } );
      };
      resolve();
    } );
  }

  logout() {
    console.log( '*** LOGOUT' );
    KeycloakService.auth.loggedIn = false;
    KeycloakService.auth.authz = null;

    window.location.href = KeycloakService.auth.logoutUrl;
  }

  /*getGroupsOfUser(user: string) {
    let url = KeycloakService.auth.authz.url;
    this.http.get( url + '/api/admin/realms/ingrid/users/{id}/groups' )
      .subscribe( response => {
        console.log( response );
      } )
  }*/
}
