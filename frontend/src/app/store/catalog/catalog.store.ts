import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { Catalog } from "../../+catalog/services/catalog.model";

export interface CatalogState extends EntityState<Catalog> {}

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "Catalog" })
export class CatalogStore extends EntityStore<CatalogState, Catalog> {
  constructor() {
    super();
  }
}
