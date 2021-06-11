import { Injectable } from "@angular/core";
import {
  EntityState,
  EntityStore,
  MultiActiveState,
  StoreConfig,
} from "@datorama/akita";
import { DocumentAbstract } from "../document/document.model";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";

export interface TreeState
  extends EntityState<DocumentAbstract>,
    MultiActiveState {
  // TODO: what is this used for?
  openedNodes: DocumentAbstract[];
  openedDocument: DocumentAbstract;
  expandedNodes: string[];
  activePathTitles: ShortTreeNode[];
  explicitActiveNode: ShortTreeNode;
  scrollPosition: number;
  isDocLoading: boolean;
  multiSelectMode: boolean;
}

const initialState = {
  active: [],
  openedDocument: null,
  expandedNodes: [],
  activePathTitles: [],
  explicitActiveNode: undefined,
  scrollPosition: 0,
  isDocLoading: false,
  multiSelectMode: false,
};

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "tree" })
export class TreeStore extends EntityStore<TreeState, DocumentAbstract> {
  constructor() {
    super(initialState);
  }
}
