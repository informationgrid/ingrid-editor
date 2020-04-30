import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {ConfigService, Configuration} from '../../services/config/config.service';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/internal/operators';
import {CatalogDataService} from './catalog-data.service';
import {HttpClient} from '@angular/common/http';
import {Catalog} from './catalog.model';
import {CatalogStore} from '../../store/catalog/catalog.store';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private configuration: Configuration;

  constructor(private router: Router,
              private dataService: CatalogDataService,
              private http: HttpClient,
              private catalogStore: CatalogStore,
              configService: ConfigService) {
    this.configuration = configService.getConfiguration();
  }

  getCatalogs(): Observable<Catalog[]> {
    return this.http.get<any[]>(this.configuration.backendUrl + 'catalogs')
      .pipe(
        map(catalogs => {
          const result = [];
          catalogs.forEach(cat => result.push(new Catalog(cat)));
          return result;
        }),
        tap(items => this.catalogStore.set(items))
        // catchError( err => this.errorService.handle( err ) )
      );
  }

  switchCatalog(id: string) {
    return this.http.post(this.configuration.backendUrl + 'user/catalog/' + id, null);
  }

  createCatalog(catalog: Catalog) {
    return this.http.post(this.configuration.backendUrl + 'catalogs', catalog)
      .pipe(tap(() => this.getCatalogs().subscribe()));
  }

  updateCatalog(catalog: Catalog) {
    return this.http.put(this.configuration.backendUrl + 'catalogs/' + catalog.id, Catalog.prepareForBackend(catalog))
      .pipe(tap(() => this.getCatalogs().subscribe()));
  }

  setCatalogAdmin(catalogName: string, userIds: string[]) {
    return this.dataService.setCatalogAdmin(catalogName, userIds);
  }

  deleteCatalog(catalogId: string) {
    return this.dataService.deleteCatalog(catalogId)
      .pipe(tap(() => this.getCatalogs().subscribe()));
  }

  getCatalog(catalogId: string) {
    return this.http.get(this.configuration.backendUrl + 'catalog/' + catalogId);
  }
}
