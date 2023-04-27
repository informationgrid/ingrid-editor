import { Injectable } from "@angular/core";
import { EntityStore, StoreConfig } from "@datorama/akita";
import { TreeState } from "../tree/tree.state";

const initialState = {
  active: [],
  openedDocument: null,
  expandedNodes: [],
  breadcrumb: [],
  explicitActiveNode: undefined,
  scrollPosition: 0,
  needsReload: false,
};

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "address-tree" })
export class AddressTreeStore extends EntityStore<TreeState> {
  constructor() {
    super(initialState);
  }
}
