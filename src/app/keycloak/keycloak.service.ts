import {Injectable} from '@angular/core';
import {Configuration} from '../config/config.service';

declare let Keycloak: any;

export interface KeycloakAuthData {
  url: string;
  realm: string;
  clientId: string;
  authServerUrl: string;
  token?: string;
  tokenParsed?: any;
  resourceAccess: any;
  init(options: any): any;
  updateToken(n: number): any;
}

export interface AuthInfo {
  loggedIn?: boolean;
  authz?: KeycloakAuthData;
  roleMapping?: any;
  logoutUrl?: string;
}

@Injectable()
export class KeycloakService {
  static auth: AuthInfo = {};

  static init(config: Configuration): Promise<any> {
    const keycloakAuth: KeycloakAuthData = Keycloak( {
      url: config.keykloakBaseUrl,
      realm: 'InGrid',
      clientId: 'ige-ng'/*,
      credentials: {
        secret: '904c3972-c6fa-4084-96f1-395a337872ae'
      }*/
    } );

    KeycloakService.auth.loggedIn = false;

    return new Promise( (resolve, reject) => {
      keycloakAuth.init( {onLoad: 'login-required'} )
        .success( () => {
          KeycloakService.auth.loggedIn = true;
          KeycloakService.auth.authz = keycloakAuth;
          // will be initialized later
          KeycloakService.auth.roleMapping = [];
          KeycloakService.auth.logoutUrl = keycloakAuth.authServerUrl
            + 'realms/' + keycloakAuth.realm + '/protocol/openid-connect/logout?redirect_uri='
            + document.baseURI;
          resolve();
        } )
        .error( (e) => {
          console.error('Error initializing Keycloak', e);
          reject(e);
        } );
    } );
  }

  isInitialized(): boolean {
    return KeycloakService.auth.authz !== undefined;
  }

  logout() {
    console.log( '*** LOGOUT' );
    KeycloakService.auth.loggedIn = false;
    KeycloakService.auth.authz = null;

    window.location.href = KeycloakService.auth.logoutUrl;
  }

  getToken(): Promise<string> {
    return new Promise<string>( (resolve, reject) => {
      if (KeycloakService.auth.authz.token) {
        KeycloakService.auth.authz
          .updateToken( 5 )
          .success( () => {
            resolve( <string>KeycloakService.auth.authz.token );
          } )
          .error( () => {
            reject( 'Failed to refresh token' );
          } );
      } else {
        reject( 'Not logged in' );
      }
    } );
  }

  /*getGroupsOfUser(user: string) {
    let url = KeycloakService.auth.authz.url;
    this.http.get( url + '/api/admin/realms/ingrid/users/{id}/groups' )
      .subscribe( response => {
        console.log( response );
      } )
  }*/
}
