import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ConfigService, Configuration } from '../services/config.service';
import { ErrorService } from '../services/error.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';

export interface Catalog {
  id: string;
  label;
  adminUser;
}

@Injectable()
export class CatalogService {
  private demoCatalogs: Catalog[] = [
    {id: 'c1', label: 'Katalog Niedersachsen', adminUser: 'Michael Meier'},
    {id: 'c2', label: 'Katalog Brandenburg', adminUser: 'Maria Blume'},
    {id: 'c3', label: 'Katalog Hamburg', adminUser: 'Hubert Stroh'}
  ];

  private _forcedCatalog: string = null;
  private configuration: Configuration;

  catalogs$: Observable<any> = new Observable<any>();

  constructor(private router: Router, private http: HttpClient, configService: ConfigService, private errorService: ErrorService) {
    this.configuration = configService.getConfiguration();
  }

  getCatalogs(): Observable<Catalog[]> {
    return this.http.get<string[]>( this.configuration.backendUrl + 'catalogs' )
      .pipe(
        map( catalogs => {
          const result = [];
          catalogs.forEach( cat => result.push( {id: cat, label: cat} ) );
          return result;
        } )
        // catchError( err => this.errorService.handle( err ) )
      );
    // return Observable.of( this.demoCatalogs );
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
