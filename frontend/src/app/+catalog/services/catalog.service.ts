import {Injectable} from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';
import {Configuration} from '../../services/config/config.service';
import {ErrorService} from '../../services/error.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/internal/operators';
import {CatalogDataService} from "./catalog-data.service";

export interface Catalog {
  id: string;
  label;
  adminUser;
}

@Injectable()
export class CatalogService {

  private _forcedCatalog: string = null;
  private configuration: Configuration;

  catalogs$: Observable<any> = new Observable<any>();

  constructor(private router: Router, private dataService: CatalogDataService, private errorService: ErrorService) {
  }

  getCatalogs(): Observable<Catalog[]> {
    return this.dataService.getCatalogs()
      .pipe(
        map( catalogs => {
          const result = [];
          catalogs.forEach( cat => result.push( {id: cat, label: cat} ) );
          return result;
        } )
        // catchError( err => this.errorService.handle( err ) )
      );
    // return of( this.demoCatalogs );
  }

  forceCatalog(id: string) {

    // TODO: it's better to store this information and use this in the actual backend requests
    this._forcedCatalog = id;

    const extras: NavigationExtras = {
      queryParams: {forceCatalog: id}
    };

    this.router.navigate( ['/form'], extras );
  }

  createCatalog(name: string) {
    return this.dataService.createCatalog(name);
  }

  setCatalogAdmin(catalogName: string, userId: string) {
    return this.dataService.setCatalogAdmin(catalogName, userId);
  }
}
