import { TreeActionType } from "./tree.component";
import { NodePermission } from "../../../models/path-response";

export class ShortTreeNode {
  constructor(
    public id: string,
    public title: string,
    public permission: NodePermission = {
      canRead: true,
      canWrite: true,
      canOnlyWriteSubtree: false,
    },
    public disabled = false
  ) {}
}

export class TreeAction {
  constructor(public type: TreeActionType, public id: string) {}
}
