import { Injectable } from "@angular/core";
import { EntityStore, StoreConfig } from "@datorama/akita";
import { DocumentAbstract } from "../document/document.model";
import { TreeState } from "./tree.state";

const initialState = {
  active: [],
  openedDocument: null,
  expandedNodes: [],
  breadcrumb: [],
  explicitActiveNode: undefined,
  scrollPosition: 0,
  isDocLoading: false,
  multiSelectMode: false,
  datasetsChanged: null,
  needsReload: false,
};

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "tree" })
export class TreeStore extends EntityStore<TreeState, DocumentAbstract> {
  constructor() {
    super(initialState);
  }
}
