import { Observable, of } from "rxjs";
import { Catalog } from "./catalog.model";

export class CatalogMockService {
  private demoCatalogs: Catalog[] = [
    new Catalog({
      id: "c1",
      label: "Katalog Niedersachsen",
      adminUser: "Michael Meier",
      type: "xxx",
    }),
    new Catalog({
      id: "c2",
      label: "Katalog Brandenburg",
      adminUser: "Maria Blume",
      type: "xxx",
    }),
    new Catalog({
      id: "c3",
      label: "Katalog Hamburg",
      adminUser: "Hubert Stroh",
      type: "xxx",
    }),
  ];

  getCatalogs(): Observable<string[]> {
    return of(["berlin"]);
  }

  createCatalog(name: string) {
    return null;
  }

  setCatalogAdmin(catalogName: string, userId: string) {
    return null;
  }
}
