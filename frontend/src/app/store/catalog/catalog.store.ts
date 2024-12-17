/**
 * ==================================================
 * Copyright (C) 2021-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { patchState, signalStore, withMethods } from "@ngrx/signals";
import {
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { Catalog } from "../../+catalog/services/catalog.model";

export const CatalogStore = signalStore(
  { providedIn: "root" },
  withEntities<Catalog>(),
  withMethods((store) => ({
    set(catalogs: Catalog[]): void {
      patchState(store, setAllEntities(catalogs));
    },
    update(id: string, catalog: Partial<Catalog>): void {
      patchState(store, updateEntity({ id: id, changes: catalog }));
    },
  })),
);
