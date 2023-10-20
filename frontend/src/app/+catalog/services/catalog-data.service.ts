import { Observable } from "rxjs";
import {
  ConfigService,
  Configuration,
} from "../../services/config/config.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CatalogDataService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  getCatalogs(): Observable<any[]> {
    return this.http.get<string[]>(this.configuration.backendUrl + "catalogs");
  }

  createCatalog(name: string) {
    return this.http
      .post(this.configuration.backendUrl + "catalogs/" + name, null)
      .pipe
      // catchError( err => this.errorService.handle( err ) )
      ();
  }

  setCatalogAdmin(catalogName: string, userIds: string[]) {
    return this.http.post(
      this.configuration.backendUrl + "info/setCatalogAdmin",
      {
        catalogName: catalogName,
        userIds: userIds,
      },
    );
  }

  deleteCatalog(name: string) {
    return this.http.delete(this.configuration.backendUrl + "catalogs/" + name);
  }
}
