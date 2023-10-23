import { Injectable } from "@angular/core";
import { ConfigDataService } from "./config-data.service";
import { BehaviorSubject } from "rxjs";
import { Catalog } from "../../+catalog/services/catalog.model";
import { coerceArray } from "@datorama/akita";
import { IgeError } from "../../models/ige-error";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { tap } from "rxjs/operators";
import { BehaviourFormatBackend } from "../behavior/behaviour.service";

export class Configuration {
  constructor(
    public keycloakUrl: string,
    public keycloakRealm: string,
    public keycloakClientId: string,
    public keycloakEnabled: boolean,
    public contextPath: string,
    public backendUrl: string,
    public featureFlags: any,
    public brokerUrl: string,
    public supportEmail: string,
    public mapTileUrl: string,
    public nominatimUrl: string,
    public showAccessibilityLink: boolean,
  ) {}
}

export interface Version {
  version: string;
  date: string;
  commitId: string;
}

export interface UserInfo {
  id: number;
  login: string;
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
  externalHelp?: string;

  useElasticsearch?: boolean;
  permissions: string[];
  parentProfile?: string;
  plugins?: BehaviourFormatBackend[];
}

export interface CMSPage {
  pageId: string;
  content: string;
}

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  public static catalogId: string;

  public static backendApiUrl: string;

  private config: Configuration;

  defaultConfig: Partial<Configuration> = {
    contextPath: "/",
    featureFlags: {},
  };

  $userInfo: BehaviorSubject<UserInfo> = new BehaviorSubject(null);

  private dataService: ConfigDataService;
  private isAdministrator = false;
  private isSuperAdministrator = false;
  private _hasRootWritePermission = false;

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) {
    this.dataService = new ConfigDataService(http);
  }

  async load(): Promise<Configuration> {
    console.log("=== ConfigService ===");

    let json = await this.dataService.load();
    this.config = { ...this.defaultConfig, ...json };
    this.config.backendUrl = this.config.contextPath + "api/";
    ConfigService.backendApiUrl = this.config.backendUrl;
    this.dataService.config = this.config;
    return this.config;
  }

  // TODO: refactor to fetchCurrentUserInfo()
  async getCurrentUserInfo(): Promise<UserInfo> {
    let userInfo = await this.dataService.getCurrentUserInfo();
    if (userInfo === null) {
      throw new IgeError("Could not get current user");
    }
    ConfigService.catalogId = userInfo.currentCatalog.id;
    this.isSuperAdministrator = userInfo.role === "ige-super-admin";
    this.isAdministrator =
      this.isSuperAdministrator || userInfo.role === "cat-admin";
    this._hasRootWritePermission =
      userInfo.permissions.indexOf("can_write_root") !== -1;
    this.$userInfo.next(userInfo);
    return userInfo;
  }

  getConfiguration(): Configuration {
    return this.config;
  }

  isAdmin(): boolean {
    return this.isAdministrator;
  }

  isSuperAdmin(): boolean {
    return this.isSuperAdministrator;
  }

  hasWriteRootPermission(): boolean {
    return this._hasRootWritePermission;
  }

  hasFlags(flags: string | string[]) {
    const userFlags = this.config.featureFlags;
    return coerceArray(flags).every((current) => userFlags[current]);
  }

  hasPermission(neededPermission: string | string[]): boolean {
    const user = this.$userInfo.getValue();
    return this.hasExplicitPermission(neededPermission, user);
  }

  hasExplicitPermission(
    neededPermission: string | string[],
    user: UserInfo,
  ): boolean {
    if (neededPermission instanceof Array) {
      return (
        user?.permissions?.filter(
          (value) => neededPermission.indexOf(value) !== -1,
        ).length > 0
      );
    } else {
      return (
        !neededPermission ||
        user?.permissions?.indexOf(<string>neededPermission) !== -1
      );
    }
  }

  saveIBusConfig(value: any) {
    return this.http
      .put<any>(`${this.config.backendUrl}config/ibus`, value)
      .pipe(tap(() => this.snackbar.open("Konfiguration wurde gespeichert")));
  }

  getIBusConfig() {
    return this.http.get<any>(`${this.config.backendUrl}config/ibus`);
  }

  isIBusConnected(index: number) {
    return this.http.get<boolean>(
      `${this.config.backendUrl}config/ibus/connected/${index}`,
    );
  }

  getCMSPages() {
    return this.http.get<CMSPage[]>(`${this.config.backendUrl}config/cms`);
  }

  updateCMSPage(content: CMSPage[]) {
    return this.http.put<void>(`${this.config.backendUrl}config/cms`, content);
  }
}
