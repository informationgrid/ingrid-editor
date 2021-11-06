import { Injectable } from "@angular/core";
import { ConfigDataService } from "./config-data.service";
import { BehaviorSubject } from "rxjs";
import { Catalog } from "../../+catalog/services/catalog.model";
import { coerceArray } from "@datorama/akita";
import { IgeError } from "../../models/ige-error";

export class Configuration {
  constructor(
    public keykloakBaseUrl: string,
    public backendUrl: string,
    public featureFlags: any,
    public brokerUrl: string
  ) {}
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
  email: string;

  assignedCatalogs: any[];
  role: string;
  groups: string[];
  currentCatalog: Catalog;
  lastLogin?: Date;
  version: Version;

  useElasticsearch?: boolean;
  permissions: string[];
}

@Injectable({
  providedIn: "root",
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
    console.log("=== ConfigService ===");

    return this.dataService.load(url).then((json) => {
      this.config = json;
      this.dataService.config = this.config;
      return this.config;
    });
  }

  dummyLoginForDevelopment() {
    return this.dataService.dummyLoginForDevelopment();
  }

  // TODO: refactor to fetchCurrentUserInfo()
  getCurrentUserInfo(token?: string): Promise<UserInfo> {
    return this.dataService.getCurrentUserInfo(token).then((userInfo) => {
      if (userInfo === null) {
        throw new IgeError("Could not get current user");
      }

      this.isAdministrator =
        userInfo.role === "ige-super-admin" || userInfo.role === "cat-admin";

      this.$userInfo.next(userInfo);
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
    return coerceArray(flags).every((current) => userFlags[current]);
  }

  hasPermission(neededPermission: string | string[]): boolean {
    const user = this.$userInfo.getValue();
    const hasExplicitPermission = this.hasExplicitPermission(
      neededPermission,
      user
    );
    if (!hasExplicitPermission && this.isAdministrator) {
      console.warn(
        "Superadmin does not explicitly have all requested permissions: ",
        neededPermission
      );
      return true;
    }
    return hasExplicitPermission;
  }

  hasExplicitPermission(
    neededPermission: string | string[],
    user: UserInfo
  ): boolean {
    if (neededPermission instanceof Array) {
      return (
        user?.permissions?.filter(
          (value) => neededPermission.indexOf(value) !== -1
        ).length > 0
      );
    } else {
      return (
        !neededPermission ||
        user?.permissions?.indexOf(<string>neededPermission) !== -1
      );
    }
  }
}
