import { Configuration, UserInfo } from "./config.service";
import { IgeException } from "../../server-validation.util";
import { environment } from "../../../environments/environment";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { map } from "rxjs/operators";
import { CatalogService } from "../../+catalog/services/catalog.service";

export class ConfigDataService {
  config: Configuration;

  constructor(private httpClient: HttpClient) {}

  private getEnvironmentConfig(): Promise<Configuration> {
    return this.httpClient.get<any>(environment.configFile).toPromise();
  }

  /**
   * Get environment config from frontend and add configuration coming from
   * backend. Backend configuration is easier since environment variables can
   * be used directly when creating docker container. However we need at least
   * the URL from the backend to make our requests. This needs to be changed if
   * the application is behind a proxy pass (with a context path).
   */
  async load(): Promise<any> {
    const config = await this.getEnvironmentConfig();
    return this.httpClient
      .get<any>(config.contextPath + "api/config")
      .pipe(map((data) => ({ ...config, ...data })))
      .toPromise();
  }

  getCurrentUserInfo(): Promise<UserInfo> {
    return (
      this.httpClient
        .get<any>(this.config.backendUrl + "info/currentUser")
        .toPromise()
        // TODO: if database is not initialized then response is not JSON
        //       change backend response or catch parse error
        .then(ConfigDataService.mapUserInformation)
        .catch((e: IgeException | XMLHttpRequest | string) => {
          if (typeof e === "string") {
            if (e.indexOf("Error occurred while trying to proxy to") !== -1) {
              console.error("No running backend");
              throw new Error("Backend does not seem to run");
            } else {
              console.error("Could not get current user info", e);
            }
          } else if ((<XMLHttpRequest>e).status === 401) {
            throw new Error(
              "Backend scheint nicht korrekt für Keycloak konfiguriert zu sein"
            );
          } else if ((<XMLHttpRequest>e).status === 403) {
            throw new Error(
              "Sie sind kein IGE-Benutzer. Bitte wenden Sie sich an einen Administrator."
            );
          } else {
            if (e instanceof HttpErrorResponse) {
              const error = <IgeException>e.error;
              if (error.errorCode === "PROFILE_NOT_FOUND") {
                throw new Error(
                  `Das Profil "${error.data.id}" ist im Backend scheinbar nicht aktiviert.`
                );
              } else {
                throw new Error(error.errorText);
              }
            } else {
              throw new Error((<IgeException>e).errorText);
            }
          }
          return ConfigDataService.mapUserInformation({});
        })
    );
  }

  private static mapUserInformation(json) {
    return <UserInfo>{
      assignedCatalogs: json.assignedCatalogs ?? [],
      name: json.name,
      firstName: json.firstName,
      lastName: json.lastName,
      email: json.email,
      role: json.role ?? "",
      groups: json.groups ?? [],
      userId: json.userId,
      currentCatalog: CatalogService.mapCatalog(json.currentCatalog) ?? {},
      catalogProfile: json.catalogProfile,
      version: json.version,
      externalHelp: json.externalHelp,
      lastLogin: json.lastLogin ? new Date(json.lastLogin) : undefined,
      useElasticsearch: json.useElasticsearch === true,
      permissions: json.permissions ?? [],
    };
  }
}
