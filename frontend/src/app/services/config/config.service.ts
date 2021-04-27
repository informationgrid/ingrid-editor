import {Injectable} from '@angular/core';
import {ConfigDataService} from './config-data.service';
import {BehaviorSubject} from 'rxjs';
import {Catalog} from '../../+catalog/services/catalog.model';
import {coerceArray} from '@datorama/akita';

export class Configuration {
  constructor(public keykloakBaseUrl: string, public backendUrl: string, public featureFlags: any) {
  }
}

export interface Version {
  version: string;
  date: string;
  commitId: string;
}

export interface UserInfo {
  userId: string;
  name: string;
  firstName: string;
  lastName: string;

  assignedCatalogs: any[];
  roles: string[];
  currentCatalog: Catalog;
  lastLogin?: Date;
  version: Version;

  useElasticsearch: boolean;
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
      });
  }


  getConfiguration(): Configuration {
    return this.config;
  }

  isAdmin(): boolean {
    return this.isAdministrator;
  }

  hasFlags(flags: string | string[]) {
    const userFlags = this.config.featureFlags;
    return coerceArray(flags).every(current => userFlags[current]);
  }
}
