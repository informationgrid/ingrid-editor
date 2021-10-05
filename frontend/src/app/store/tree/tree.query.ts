import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { TreeState, TreeStore } from "./tree.store";
import { DocumentAbstract } from "../document/document.model";
import { Observable } from "rxjs";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";

@Injectable({
  providedIn: "root",
})
export class TreeQuery extends QueryEntity<TreeState, DocumentAbstract> {
  rootDocuments$: Observable<DocumentAbstract[]> = this.selectAll({
    filterBy: (entity) => entity._parent === null,
  });
  openedDocument$: Observable<DocumentAbstract> = this.select(
    (state) => state.openedDocument
  );
  expandedNodes$: Observable<string[]> = this.select(
    (state) => state.expandedNodes
  );
  breadcrumb$: Observable<ShortTreeNode[]> = this.select(
    (state) => state.breadcrumb
  );
  selectedNodes$: Observable<string[]> = this.select((state) => state.selected);
  explicitActiveNode$: Observable<ShortTreeNode> = this.select(
    (state) => state.explicitActiveNode
  );
  multiSelectMode$: Observable<boolean> = this.select(
    (state) => state.multiSelectMode
  );

  constructor(protected store: TreeStore) {
    super(store);
  }

  getOpenedDocument(): DocumentAbstract {
    return this.store.getValue().openedDocument;
  }

  getChildren(parent: string): DocumentAbstract[] {
    return this.getAll().filter((doc) => doc._parent === parent);
  }

  getParents(id: string): ShortTreeNode[] {
    const parents = [];
    let entity = this.getEntity(id);
    let parent = this.getEntity(entity._parent);
    while (parent) {
      parents.push(parent);
      parent = this.getEntity(parent._parent);
    }
    return parents;
  }

  getFirstParentFolder(childId: string): DocumentAbstract {
    let child = this.getEntity(childId);
    if (child._type === "FOLDER") {
      return child;
    }

    while (child._parent !== null) {
      child = this.getEntity(child._parent);
      if (child._type === "FOLDER") {
        return child;
      }
    }

    return null;
  }
}
