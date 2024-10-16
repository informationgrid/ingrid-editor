/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Injectable, Type } from "@angular/core";
import { ConfigDataService } from "./config-data.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Catalog } from "../../+catalog/services/catalog.model";
import { coerceArray } from "@datorama/akita";
import { IgeError } from "../../models/ige-error";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { catchError, map, tap } from "rxjs/operators";
import { BehaviourFormatBackend } from "../behavior/behaviour.service";
import { CodelistStore } from "../../store/codelist/codelist.store";

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
    public mapWMSUrl: string,
    public mapWMSLayers: string,
    public mapAttribution: string,
    public nominatimUrl: string,
    public nominatimDetailUrl: string,
    public showAccessibilityLink: boolean,
    public allowOverwriteOnVersionConflict?: boolean,
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

export interface Connections {
  connections: (ConnectionInfo | ConnectionInfoElastic)[];
}

export interface BackendConnections {
  ibus: ConnectionInfo[];
  elasticsearch: ConnectionInfo[];
}

export interface ConnectionInfo {
  _type: "ibus" | "elastic";
  id: number;
  name: string;
  ip: string;
  port: number;
}

export interface ConnectionInfoElastic {
  _type: "elastic";
  id: number;
  name: string;
  ip: string;
  port: number;
  isSecure: boolean;
  username: string;
  password: string;
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

  registeredPlugins: { [x: string]: boolean } = {};

  private dataService: ConfigDataService;
  private isMdAdministrator = false;
  private isAdministrator = false;
  private isSuperAdministrator = false;
  private _hasRootWritePermission = false;
  profileModule: Type<any>;

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private codelistStore: CodelistStore,
  ) {
    this.dataService = new ConfigDataService(http);
  }

  async load(): Promise<Configuration> {
    console.debug("=== ConfigService ===");

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
    this.codelistStore.update(() => ({
      favorites:
        userInfo.currentCatalog.settings?.config?.codelistFavorites ?? {},
    }));
    this.isSuperAdministrator = userInfo.role === "ige-super-admin";
    this.isAdministrator =
      this.isSuperAdministrator || userInfo.role === "cat-admin";
    this.isMdAdministrator =
      this.isAdministrator || userInfo.role === "md-admin";
    this._hasRootWritePermission =
      userInfo.permissions.indexOf("can_write_root") !== -1;
    this.$userInfo.next(userInfo);
    return userInfo;
  }

  getConfiguration(): Configuration {
    return this.config;
  }

  /**
   * Checks if the current user is at least a Metadata Administrator.
   *
   * @returns {boolean} True if the user is at least a Metadata Administrator, false otherwise.
   */
  hasMdAdminRights(): boolean {
    return this.isMdAdministrator;
  }

  /**
   * Checks if the current user is at least a Catalog Administrator.
   *
   * @returns {boolean} True if the user is at least a Catalog Administrator, false otherwise.
   */
  hasCatAdminRights(): boolean {
    return this.isAdministrator;
  }

  /**
   * Checks if the current user is a Super Administrator.
   *
   * @returns {boolean} True if the user is a Super Administrator, false otherwise.
   */
  hasSuperAdminRights(): boolean {
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

  saveConnectionConfig(value: Connections): Observable<ConnectionInfo[]> {
    const valueForBackend = this.prepareConnectionsForIBus(value);
    return this.http
      .put<BackendConnections>(
        `${this.config.backendUrl}config/connections`,
        valueForBackend,
      )
      .pipe(
        tap(() => this.snackbar.open("Konfiguration wurde gespeichert")),
        map((result) => this.prepareConnectionsForFrontend(result).connections),
      );
  }

  getConnectionsConfig() {
    return this.http
      .get<any>(`${this.config.backendUrl}config/connections`)
      .pipe(
        catchError((err) => this.handleGetConnectionsError(err)),
        map((config) => this.prepareConnectionsForFrontend(config)),
      );
  }

  isConnectionOK(id: string) {
    return this.http.get<boolean>(
      `${this.config.backendUrl}config/connections/connected/${id}`,
    );
  }

  getCMSPages() {
    return this.http.get<CMSPage[]>(`${this.config.backendUrl}config/cms`);
  }

  updateCMSPage(content: CMSPage[]) {
    return this.http.put<void>(`${this.config.backendUrl}config/cms`, content);
  }

  private prepareConnectionsForIBus(value: Connections): BackendConnections {
    return {
      ibus: value.connections.filter((item) => item._type === "ibus"),
      elasticsearch: value.connections.filter(
        (item) => item._type === "elastic",
      ),
    };
  }

  private prepareConnectionsForFrontend(
    value: BackendConnections,
  ): Connections {
    return {
      connections: [
        ...this.addType("ibus", value.ibus),
        ...this.addType(
          "elastic",
          value.elasticsearch.map((conn) => {
            const newConn = <ConnectionInfoElastic>conn;
            newConn.isSecure =
              newConn.username?.length > 0 && newConn.password?.length > 0;
            return newConn;
          }),
        ),
      ],
    };
  }

  private addType(type: "ibus" | "elastic", value: any[]) {
    return (value ?? []).map((item) => {
      item._type = type;
      return item;
    });
  }

  private handleGetConnectionsError(err: any): Observable<BackendConnections> {
    console.error("Das Laden der Verbindungen ist fehlgeschlagen", err);
    return of({ ibus: [], elasticsearch: [] });
  }
}
