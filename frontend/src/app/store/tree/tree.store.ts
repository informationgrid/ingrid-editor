import { Injectable } from "@angular/core";
import {
  EntityState,
  EntityStore,
  MultiActiveState,
  StoreConfig,
} from "@datorama/akita";
import { DocumentAbstract } from "../document/document.model";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { UpdateDatasetInfo } from "../../models/update-dataset-info.model";

export interface TreeState
  extends EntityState<DocumentAbstract>,
    MultiActiveState {
  // TODO: what is this used for?
  openedNodes: DocumentAbstract[];
  openedDocument: DocumentAbstract;
  expandedNodes: string[];
  breadcrumb: ShortTreeNode[];
  explicitActiveNode: ShortTreeNode;
  scrollPosition: number;
  isDocLoading: boolean;
  multiSelectMode: boolean;
  datasetsChanged: UpdateDatasetInfo;
}

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
};

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "tree" })
export class TreeStore extends EntityStore<TreeState, DocumentAbstract> {
  constructor() {
    super(initialState);
  }
}
