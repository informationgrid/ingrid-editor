import {Injectable} from '@angular/core';
import {Profile} from "../formular/profile";
import {ConfigDataService} from "./config-data.service";

export class Configuration {
  constructor(public keykloakBaseUrl: string, public backendUrl: string) {
  }
}

export type UserInfo = {
  userId: string;
  name: string;

  assignedCatalogs: any[];
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config: Configuration;

  private userInfo: UserInfo;
  private titleFields: string[];
  promiseProfilePackageLoaded: Promise<Profile[]>;
  private dataService: ConfigDataService;

  constructor() {
    this.dataService = new ConfigDataService();
  }

  load(url: string): Promise<Configuration> {
    console.log( '=== ConfigService ===' );

    return this.dataService.load(url)
      .then( json => {
        this.config = json;
        this.dataService.config = this.config;
        return this.config;
      } );

  }

  getUserInfo(): UserInfo {
    return this.userInfo;
  }

  // TODO: refactor to fetchCurrentUserInfo()
  getCurrentUserInfo(): Promise<UserInfo> {
    return this.dataService.getCurrentUserInfo()
      .then( userInfo => {
        this.userInfo = userInfo;
        return userInfo;
      })
      .catch(e => {
        debugger;
        console.error(e);
        return <UserInfo>{

        };
      });
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

  isAdmin() {
    return this.userInfo.roles && this.userInfo.roles.includes( 'admin');
  }
}
