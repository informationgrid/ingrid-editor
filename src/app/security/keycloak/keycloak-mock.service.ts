import { Injectable } from '@angular/core';
import { AuthInfo, KeycloakAuthData, KeycloakService } from './keycloak.service';
import { Configuration } from '../../services/config.service';

// access token with a very long expiry date
const mockToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ1N2tJODdXNDhydjJ3WlFBOUNxVWY2d1p6bnh3R1pHUldmYjE4' +
  'clFicWFnIn0.eyJqdGkiOiJkZjMxM2FhMy01ZDE1LTQ1ZmYtYWU2My1kNDcwNzg0NGZhMTkiLCJleHAiOjE1ODU0OTk3MTgsIm5iZiI6MCwiaWF0Ijox' +
  'NDk5MTg2MTE4LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9yZWFsbXMvSW5HcmlkIiwiYXVkIjoiaWdlLW5nIiwic3ViIjoiY2ExNzMy' +
  'NjYtOWQxNC00MWRiLWFkOWMtMzcxZDBhNWJhZGU4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiaWdlLW5nIiwibm9uY2UiOiIxNGJlMjMxZC04YTMwLTQ1' +
  'NTYtOWNlYS00NGIwNjVjYmY2OTMiLCJhdXRoX3RpbWUiOjE0OTkxODYxMTgsInNlc3Npb25fc3RhdGUiOiI1MDRkNDAwNi1jZjU0LTQ0YWMtYmU0ZS05' +
  'NzFmZGVlMzZlZTMiLCJhY3IiOiIxIiwiY2xpZW50X3Nlc3Npb24iOiJjOWZjZjFjZi01ZTZjLTQyMDQtYjI0Ny0wMTljNDc4MWVhOTIiLCJhbGxvd2Vk' +
  'LW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNz' +
  'Ijp7InJlYWxtLW1hbmFnZW1lbnQiOnsicm9sZXMiOlsibWFuYWdlLXJlYWxtIiwibWFuYWdlLXVzZXJzIl19LCJpZ2UtbmciOnsicm9sZXMiOlsiYWRt' +
  'aW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sIm5h' +
  'bWUiOiJIZXJiZXJ0IExhbmRtYW5uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiaWdlIiwiZ2l2ZW5fbmFtZSI6IkhlcmJlcnQiLCJmYW1pbHlfbmFtZSI6' +
  'IkxhbmRtYW5uIn0.QqATPU4EbU-8wjQLfX1IuKwPjlMFUCBSV_jBpiaHmSD7EbndbOI50J95VaqHQH_VTjW5euDZcN1DuMPE3RwX0GhxQa4OVZGjbyrw' +
  'bdeYzn9YkDf76W6YPzf3Jm-yj_vjU177uXCNDSBgk6cU90774ce0j5fU9cQtBF7EOUPE9EJZ3niclzIOFGRPMnXSCmflS_1_veL2GL1UjuX2cITfy6ZR' +
  'DLbNxYWG3mR4UjdOiIBHXo_ZsYhQgyZvSMlg8LAEMAG4iKVT5jP60IZPs1r6DtMhU1RnqGAmMydzxc_O-R2Iv7inFxW4tlZBZH_XwfUYAe2BDcxj9uvZ' +
  '3dGmsX_2UQ';

@Injectable()
export class KeycloakMockService {
  static auth: AuthInfo = {};

  static init(config: Configuration): Promise<any> {

    console.log('=== KeycloakMockService ===');

    const keycloakAuth: KeycloakAuthData = {
      url: config.keykloakBaseUrl,
      realm: 'InGrid',
      clientId: 'ige-ng',
      authServerUrl: '',
      tokenParsed: {
        auth_time: 1499186118,
        exp: 1585499718
      },
      resourceAccess: {
        'ige-ng': {
          roles: []
        }
      },
      init: () => {},
      updateToken: () => {}
    };

    return new Promise( resolve => {
      KeycloakService.auth.loggedIn = true;
      KeycloakService.auth.authz = keycloakAuth;
      // will be initialized later
      KeycloakService.auth.roleMapping = [];
      KeycloakService.auth.logoutUrl = keycloakAuth.authServerUrl
        + 'realms/' + keycloakAuth.realm + '/protocol/openid-connect/logout?redirect_uri='
        + document.baseURI;
      KeycloakService.prototype.getToken = () => {
        return new Promise<string>( (resolveToken: any) => {
          resolveToken( mockToken );
        } );
      };
      resolve();
      // reject();
    } );
  }

  static logout() {
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
