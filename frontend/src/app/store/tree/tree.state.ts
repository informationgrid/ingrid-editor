import { EntityState, MultiActiveState } from "@datorama/akita";
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
  needsReload: boolean;
}
