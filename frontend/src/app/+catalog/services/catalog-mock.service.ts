import {Observable, of} from "rxjs";
import {Catalog} from "./catalog.service";

export class CatalogMockService {

  private demoCatalogs: Catalog[] = [
    {id: 'c1', label: 'Katalog Niedersachsen', adminUser: 'Michael Meier'},
    {id: 'c2', label: 'Katalog Brandenburg', adminUser: 'Maria Blume'},
    {id: 'c3', label: 'Katalog Hamburg', adminUser: 'Hubert Stroh'}
  ];

  getCatalogs(): Observable<string[]> {
    return of(['berlin']);
  }

  createCatalog(name: string) {
    return null;
  }

  setCatalogAdmin(catalogName: string, userId: string) {
    return null;
  }
}
