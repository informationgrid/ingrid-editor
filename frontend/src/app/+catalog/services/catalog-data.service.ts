import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Catalog} from "./catalog.service";
import {ConfigService, Configuration} from "../../services/config/config.service";
import {HttpClient} from "@angular/common/http";

export class CatalogDataService {

  private configuration: Configuration;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getCatalogs(): Observable<string[]> {
    return this.http.get<string[]>( this.configuration.backendUrl + 'catalogs' );
  }

  createCatalog(name: string) {
    return this.http.post( this.configuration.backendUrl + 'catalogs/' + name, null )
      .pipe(
        // catchError( err => this.errorService.handle( err ) )
      );
  }

  setCatalogAdmin(catalogName: string, userId: string) {
    return this.http.post( this.configuration.backendUrl + 'info/setCatalogAdmin', {
      catalogName: catalogName,
      userId: userId
    } )
  }
}
