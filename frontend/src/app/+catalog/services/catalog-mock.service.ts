import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Catalog} from "./catalog.service";
import {ConfigService, Configuration} from "../../services/config/config.service";
import {HttpClient} from "@angular/common/http";

export class CatalogMockService {

  private demoCatalogs: Catalog[] = [
    {id: 'c1', label: 'Katalog Niedersachsen', adminUser: 'Michael Meier'},
    {id: 'c2', label: 'Katalog Brandenburg', adminUser: 'Maria Blume'},
    {id: 'c3', label: 'Katalog Hamburg', adminUser: 'Hubert Stroh'}
  ];

  getCatalogs(): Observable<string[]> {
    return Observable.of(['berlin']);
  }

  createCatalog(name: string) {
    return null;
  }

  setCatalogAdmin(catalogName: string, userId: string) {
    return null;
  }
}
