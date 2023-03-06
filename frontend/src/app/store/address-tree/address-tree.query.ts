import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { AddressTreeStore } from "./address-tree.store";
import { DocumentAbstract } from "../document/document.model";
import { Observable } from "rxjs";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { UpdateDatasetInfo } from "../../models/update-dataset-info.model";
import { TreeState } from "../tree/tree.state";

@Injectable({ providedIn: "root" })
export class AddressTreeQuery extends QueryEntity<TreeState> {
  rootDocuments$: Observable<DocumentAbstract[]> = this.selectAll({
    filterBy: (entity) => entity._parent === null,
  });
  openedDocument$: Observable<DocumentAbstract> = this.select(
    (state) => state.openedDocument
  );
  breadcrumb$: Observable<ShortTreeNode[]> = this.select(
    (state) => state.breadcrumb
  );
  explicitActiveNode$: Observable<ShortTreeNode> = this.select(
    (state) => state.explicitActiveNode
  );
  multiSelectMode$: Observable<boolean> = this.select(
    (state) => state.multiSelectMode
  );

  datasetsChanged$: Observable<UpdateDatasetInfo> = this.select(
    (state) => state.datasetsChanged
  );

  constructor(protected store: AddressTreeStore) {
    super(store);
  }

  getOpenedDocument(): DocumentAbstract {
    return this.store.getValue().openedDocument;
  }

  getChildren(parent: number): DocumentAbstract[] {
    return this.getAll()
      .filter((doc) => (parent === null ? doc.isRoot : doc._parent === parent))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  getParents(id: number): DocumentAbstract[] {
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
