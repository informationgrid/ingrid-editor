import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { AddressTreeStore } from "./address-tree.store";
import { DocumentAbstract } from "../document/document.model";
import { Observable } from "rxjs";
import { TreeState } from "../tree/tree.store";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";

@Injectable({ providedIn: "root" })
export class AddressTreeQuery extends QueryEntity<TreeState> {
  openedDocument$: Observable<DocumentAbstract> = this.select(
    (state) => state.openedDocument
  );
  pathTitles$: Observable<ShortTreeNode[]> = this.select(
    (state) => state.activePathTitles
  );
  explicitActiveNode$: Observable<ShortTreeNode> = this.select(
    (state) => state.explicitActiveNode
  );
  multiSelectMode$: Observable<boolean> = this.select(
    (state) => state.multiSelectMode
  );

  constructor(protected store: AddressTreeStore) {
    super(store);
  }

  getOpenedDocument(): DocumentAbstract {
    return this.store.getValue().openedDocument;
  }

  getChildren(parent: string): DocumentAbstract[] {
    return this.getAll()
      .filter((doc) => doc._parent === parent)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  getParents(id: string): string[] {
    const parents = [];
    let parent = this.getEntity(id)._parent;
    while (parent) {
      parents.push(parent);
      parent = this.getEntity(parent)._parent;
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
