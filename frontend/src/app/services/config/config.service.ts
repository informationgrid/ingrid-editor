import { Injectable } from "@angular/core";
import { ConfigDataService } from "./config-data.service";
import { BehaviorSubject } from "rxjs";
import { Catalog } from "../../+catalog/services/catalog.model";
import { coerceArray } from "@datorama/akita";
import { IgeError } from "../../models/ige-error";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { tap } from "rxjs/operators";

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
    public menuGroups: any,
    public mapTileUrl: string,
    public nominatimUrl: string
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
  externalHelp?: string;

  useElasticsearch?: boolean;
  permissions: string[];
  parentProfile?: string;
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
    menuGroups: [
      {
        title: "Verwaltung",
        adminOnly: true,
        entries: [
          {
            label: "Allgemein",
            isRouterLink: true,
            link: "/settings/general",
          },
          {
            label: "Codelist Repository",
            isRouterLink: true,
            link: "/settings/codelist",
          },
          {
            label: "Katalogverwaltung",
            isRouterLink: true,
            link: "/settings/catalog",
          },
          {
            label: "iBus-Verwaltung",
            isRouterLink: true,
            link: "/settings/ibus",
          },
          {
            label: "Benachrichtigungen",
            isRouterLink: true,
            link: "/settings/messages",
          },
        ],
      },
      {
        title: "Informationen",
        adminOnly: false,
        entries: [
          /*
          Help gets set directly in the template
          {
            label: "Hilfe",
            isRouterLink: false,
            link: "#",
          },*/
        ],
      },
    ],
  };

  $userInfo: BehaviorSubject<UserInfo> = new BehaviorSubject(null);

  private dataService: ConfigDataService;
  private isAdministrator = false;
  private _hasRootWritePermission = false;

  constructor(private http: HttpClient, private snackbar: MatSnackBar) {
    this.dataService = new ConfigDataService(http);
  }

  load(): Promise<Configuration> {
    console.log("=== ConfigService ===");

    return this.dataService.load().then((json) => {
      this.config = { ...this.defaultConfig, ...json };
      this.config.backendUrl = this.config.contextPath + "api/";
      ConfigService.backendApiUrl = this.config.backendUrl;
      this.dataService.config = this.config;
      return this.config;
    });
  }

  // TODO: refactor to fetchCurrentUserInfo()
  getCurrentUserInfo(): Promise<UserInfo> {
    return this.dataService.getCurrentUserInfo().then((userInfo) => {
      if (userInfo === null) {
        throw new IgeError("Could not get current user");
      }

      ConfigService.catalogId = userInfo.currentCatalog.id;

      this.isAdministrator =
        userInfo.role === "ige-super-admin" || userInfo.role === "cat-admin";

      this._hasRootWritePermission =
        userInfo.permissions.indexOf("can_write_root") !== -1;

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
      `${this.config.backendUrl}config/ibus/connected/${index}`
    );
  }

  getCMSPages() {
    return this.http.get<CMSPage[]>(`${this.config.backendUrl}config/cms`);
  }

  updateCMSPage(content: CMSPage[]) {
    return this.http.put<void>(`${this.config.backendUrl}config/cms`, content);
  }
}
