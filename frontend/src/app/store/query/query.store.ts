/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Query } from "./query.model";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
} from "@ngrx/signals";
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { computed } from "@angular/core";

export const QueryStore = signalStore(
  { providedIn: "root" },
  withEntities<Query>(),
  withComputed((store) => ({
    userQueries: computed(() => {
      return store.entities().filter((entity) => !entity.isCatalogQuery);
    }),
    catalogQueries: computed(() => {
      return store.entities().filter((entity) => entity.isCatalogQuery);
    }),
  })),
  withMethods((store) => ({
    set(queries: Query[]): void {
      patchState(store, setAllEntities(queries));
    },
    add(query: Query): void {
      patchState(store, addEntity(query));
    },
    remove(id: string): void {
      patchState(store, removeEntity(id));
    },
    update(id: number, query: Query): void {
      patchState(store, updateEntity({ id: id, changes: query }));
    },
  })),
);
