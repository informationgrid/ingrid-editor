import { Configuration, UserInfo } from "./config.service";
import { Catalog } from "../../+catalog/services/catalog.model";
import { IgeException } from "../../server-validation.util";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";

export class ConfigDataService {
  config: Configuration;

  constructor(private httpClient: HttpClient) {}

  load(url: string): Promise<any> {
    return this.httpClient.get<string>(url).toPromise();
  }

  getCurrentUserInfo(): Promise<UserInfo> {
    return (
      this.httpClient
        .get<any>(this.config.backendUrl + "info/currentUser")
        .toPromise()
        // TODO: if database is not initialized then response is not JSON
        //       change backend response or catch parse error
        .then((json) => {
          return <UserInfo>{
            assignedCatalogs: json.assignedCatalogs,
            name: json.name,
            firstName: json.firstName,
            lastName: json.lastName,
            email: json.email,
            role: json.role,
            groups: json.groups,
            userId: json.userId,
            currentCatalog: json.currentCatalog
              ? new Catalog(json.currentCatalog)
              : {},
            catalogProfile: json.catalogProfile,
            version: json.version,
            lastLogin: new Date(json.lastLogin),
            useElasticsearch: json.useElasticsearch,
            permissions: json.permissions,
          };
        })
        .catch((e: IgeException | XMLHttpRequest | string) => {
          if (typeof e === "string") {
            if (e.indexOf("Cannot GET /sso/login") !== -1) {
              console.error(
                "Not logged in to keycloak. Please login first from IgeServer (localhost:8550)"
              );
              if (!environment.production) {
                window.location.href = "http://localhost:8550";
              }
              return null;
            } else if (
              e.indexOf("Error occurred while trying to proxy to") !== -1
            ) {
              console.error("No running backend");
              throw new Error("Backend does not seem to run");
            } else {
              console.error("Could not get current user info", e);
            }
          } else if ((<XMLHttpRequest>e).status === 401) {
            throw new Error(
              "Backend scheint nicht korrekt für Keycloak konfiguriert zu sein"
            );
          } else {
            throw new Error((<IgeException>e).errorText);
          }
          return <UserInfo>{
            assignedCatalogs: [],
            name: undefined,
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            role: "",
            groups: [],
            userId: undefined,
            catalogProfile: undefined,
            currentCatalog: undefined,
            version: undefined,
            useElasticsearch: false,
            permissions: [],
          };
        })
    );
  }
}
