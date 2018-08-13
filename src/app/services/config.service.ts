import { Injectable } from '@angular/core';
import { s } from '@angular/core/src/render3';
import { IgeError } from '../models/ige-error';

export class Configuration {
  constructor(public keykloakBaseUrl: string, public backendUrl: string) {
  }
}

class UserInfo {
  userId: string;
  name: string;

  assignedCatalogs: any[];
  roles: string[];
}

@Injectable()
export class ConfigService {

  private config: Configuration;

  private userInfo: UserInfo;

  load(url: string): Promise<Configuration> {
    console.log( '=== ConfigService ===' );

    return this.sendRequest( 'GET', url )
      .then( response => this.config = JSON.parse( response ) )
      .then( () => this.config );

  }

  getCurrentUserInfo(): Promise<any> {
    return this.sendRequest('GET', this.config.backendUrl + 'info/currentUser' )
      .then( response => {
        this.userInfo = JSON.parse(response);

        return this.userInfo;
      });
  }

  private sendRequest(method = 'GET', url = null): Promise<string> {
    return new Promise( (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType( 'application/json' );
      xhr.open( method, url, true );
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve( xhr.responseText );
          } else {
            reject( JSON.parse(xhr.responseText) );
          }
        }
      };
      xhr.send( null );
    } );
  }

  getConfiguration(): Configuration {
    return this.config;
  }

}
