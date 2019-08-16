import {Injectable} from '@angular/core';
import {Profile} from "../formular/profile";
import {ConfigDataService} from "./config-data.service";
import {BehaviorSubject} from 'rxjs';

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

  $userInfo: BehaviorSubject<UserInfo> = new BehaviorSubject(null);

  private titleFields: string[];
  promiseProfilePackageLoaded: Promise<Profile[]>;
  private dataService: ConfigDataService;
  private isAdministrator: boolean = false;

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

  // TODO: refactor to fetchCurrentUserInfo()
  getCurrentUserInfo(): Promise<UserInfo> {
    return this.dataService.getCurrentUserInfo()
      .then( userInfo => {
        this.$userInfo.next(userInfo);
        this.isAdministrator = userInfo.roles && userInfo.roles.includes( 'admin');
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

  isAdmin(): boolean {
    return this.isAdministrator;
  }
}
