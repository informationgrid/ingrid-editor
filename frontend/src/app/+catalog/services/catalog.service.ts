import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {ConfigService, Configuration} from '../../services/config/config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/internal/operators';
import {CatalogDataService} from './catalog-data.service';
import {CatalogSettings} from '../../dialogs/catalog/new-catalog/new-catalog-dialog.component';
import {HttpClient} from '@angular/common/http';
import {Catalog} from './catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private _forcedCatalog: string = null;
  private configuration: Configuration;

  constructor(private router: Router, private dataService: CatalogDataService, private http: HttpClient,
              configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getCatalogs(): Observable<Catalog[]> {
    return this.http.get<any[]>( this.configuration.backendUrl + 'catalogs' )
      .pipe(
        map(catalogs => {
          const result = [];
          catalogs.forEach(cat => result.push(new Catalog(cat)));
          return result;
        })
        // catchError( err => this.errorService.handle( err ) )
      );
    // return of( this.demoCatalogs );
  }

  switchCatalog(id: string) {
    return this.http.post(this.configuration.backendUrl + 'user/catalog/' + id, null);
  }

  createCatalog(catalog: Catalog) {
    return this.http.post(this.configuration.backendUrl + 'catalogs', catalog);
  }

  updateCatalog(catalog: Catalog) {
    return this.http.put(this.configuration.backendUrl + 'catalogs/' + catalog.id, catalog.prepareForBackend());
  }

  setCatalogAdmin(catalogName: string, userIds: string[]) {
    return this.dataService.setCatalogAdmin(catalogName, userIds);
  }

  deleteCatalog(catalogId: string) {
    return this.dataService.deleteCatalog(catalogId);
  }

  getCatalog(catalogId: string) {
    return this.http.get(this.configuration.backendUrl + 'catalog/' + catalogId);
  }
}
