import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NavigationExtras, Router } from '@angular/router';

export interface Catalog {
  id: string;
  label;
  adminUser;
}

@Injectable()
export class CatalogService {
  private demoCatalogs: Catalog[] = [
    { id: 'c1', label: 'Katalog Niedersachsen', adminUser: 'Michael Meier' },
    { id: 'c2', label: 'Katalog Brandenburg', adminUser: 'Maria Blume' },
    { id: 'c3', label: 'Katalog Hamburg', adminUser: 'Hubert Stroh' }
  ];

  private _forcedCatalog: string = null;

  constructor(private router: Router) { }

  getCatalogs(): Observable<Catalog[]> {
    return Observable.of(this.demoCatalogs);
  }

  forceCatalog(id: string) {

    // TODO: it's better to store this information and use this in the actual backend requests
    this._forcedCatalog = id;

    const extras: NavigationExtras = {
      queryParams: { forceCatalog: id }
    };

    this.router.navigate(['/form'], extras );
  }
}
