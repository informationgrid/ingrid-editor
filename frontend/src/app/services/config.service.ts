import { Injectable } from '@angular/core';
import {Profile} from "./formular/profile";

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
  private titleFields: string[];
  promiseProfilePackageLoaded: Promise<Profile[]>;

  load(url: string): Promise<Configuration> {
    console.log( '=== ConfigService ===' );

    return this.sendRequest( 'GET', url )
      .then( response => this.config = JSON.parse( response ) )
      .then( () => this.config );

  }

  getUserInfo(): UserInfo {
    return this.userInfo;
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

  setTitleFields(titleFields: string[]) {
    this.titleFields = titleFields;
  }

  getTitleFields(): string[] {
    return this.titleFields;
  }

  setProfilePackagePromise(initialized: Promise<Profile[]>) {
    this.promiseProfilePackageLoaded = initialized;
  }
}
