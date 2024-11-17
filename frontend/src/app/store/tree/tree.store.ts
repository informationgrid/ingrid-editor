/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { DocumentAbstract } from "../document/document.model";
import { patchState, signalStore, withMethods } from "@ngrx/signals";
import {
  addEntities,
  addEntity,
  removeEntities,
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";

export const TreeStore = signalStore(
  { providedIn: "root" },
  withEntities<DocumentAbstract>(),
  withMethods((store) => ({
    set(docs: DocumentAbstract[]): void {
      patchState(store, setAllEntities(docs));
    },
    update(id: number, doc: Partial<DocumentAbstract>): void {
      patchState(store, updateEntity({ id: id, changes: doc }));
    },
    add(docs: DocumentAbstract[]): void {
      patchState(store, addEntities(docs));
    },
    create(doc: DocumentAbstract): void {
      patchState(store, addEntity(doc));
    },
    remove(ids: number[]): void {
      patchState(store, removeEntities(ids));
    },
    getFirstParentFolder(childId: number): DocumentAbstract {
      let child = store.entityMap()[childId];
      if (child._type === "FOLDER") {
        return child;
      }

      while (child._parent !== null) {
        child = store.entityMap()[child._parent];
        if (child._type === "FOLDER") {
          return child;
        }
      }

      return null;
    },
    getByUuid(uuid: string): DocumentAbstract {
      return store.entities().find((entity) => entity._uuid === uuid);
    },
    getChildren(parent: number): DocumentAbstract[] {
      return store
        .entities()
        .filter((doc) =>
          parent === null ? doc.isRoot : doc._parent === parent,
        );
    },
    getParents(id: number): DocumentAbstract[] {
      const parents = [];
      let entity = store.entityMap()[id];
      let parent = store.entityMap()[entity._parent];
      while (parent) {
        parents.push(parent);
        parent = store.entityMap()[parent._parent];
      }
      return parents;
    },
  })),
);
