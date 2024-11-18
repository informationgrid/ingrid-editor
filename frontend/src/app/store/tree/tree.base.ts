import { DocumentAbstract } from "../document/document.model";
import { patchState } from "@ngrx/signals";
import {
  addEntities,
  addEntity,
  removeEntities,
  setAllEntities,
  updateEntity,
} from "@ngrx/signals/entities";
import { sleep } from "../../services/utils";

export function getTreeStoreMethods() {
  return (store) => ({
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
    async waitForDocumentInStore(id: string | number, maxTimes: number = 10) {
      while (maxTimes > 0) {
        if (store.entityMap()[id]) return;
        else await sleep(100);
      }
    },
    async byId(id: number): Promise<DocumentAbstract> {
      await this.waitForDocumentInStore(id);
      return store.entityMap()[id];
    },
  });
}
