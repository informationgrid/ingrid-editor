import {Injectable} from '@angular/core';
import {ConfigDataService} from './config-data.service';
import {BehaviorSubject} from 'rxjs';
import {Catalog} from '../../+catalog/services/catalog.model';

export class Configuration {
  constructor(public keykloakBaseUrl: string, public backendUrl: string) {
  }
}

export interface UserInfo {
  userId: string;
  name: string;

  assignedCatalogs: any[];
  roles: string[];
  currentCatalog: Catalog;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config: Configuration;

  $userInfo: BehaviorSubject<UserInfo> = new BehaviorSubject(null);

  private dataService: ConfigDataService;
  private isAdministrator = false;

  constructor() {
    this.dataService = new ConfigDataService();
  }

  load(url: string): Promise<Configuration> {
    console.log('=== ConfigService ===');

    return this.dataService.load(url)
      .then(json => {
        this.config = json;
        this.dataService.config = this.config;
        return this.config;
      });

  }

  // TODO: refactor to fetchCurrentUserInfo()
  getCurrentUserInfo(): Promise<UserInfo> {
    return this.dataService.getCurrentUserInfo()
      .then(userInfo => {
        this.$userInfo.next(userInfo);
        this.isAdministrator = userInfo.roles && userInfo.roles.indexOf('admin') !== -1;
        return userInfo;
      })
      .catch(e => {
        console.error(e);
        return <UserInfo>{};
      });
  }


  getConfiguration(): Configuration {
    return this.config;
  }

  isAdmin(): boolean {
    return this.isAdministrator;
  }
}
