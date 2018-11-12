import {Injectable} from '@angular/core';
import {Profile} from "../formular/profile";
import {ConfigDataService} from "./config-data.service";

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

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config: Configuration;

  private userInfo: UserInfo;
  private titleFields: string[];
  promiseProfilePackageLoaded: Promise<Profile[]>;

  constructor(private dataService: ConfigDataService) {}

  load(url: string): Promise<Configuration> {
    console.log( '=== ConfigService ===' );

    return this.dataService.load(url)
      .then( json => this.config = json )
      .then( () => this.config );

  }

  getUserInfo(): UserInfo {
    return this.userInfo;
  }

  getCurrentUserInfo(): Promise<any> {
    return this.dataService.getCurrentUserInfo()
      .then( userInfo => {
        this.userInfo = userInfo;
        return userInfo;
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
}
