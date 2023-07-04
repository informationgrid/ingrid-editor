import { TreeActionType } from "./tree.component";
import { NodePermission } from "../../../models/path-response";

export class ShortTreeNode {
  constructor(
    public id: number,
    public title: string,
    public permission: NodePermission = {
      canRead: false,
      canWrite: true,
      canOnlyWriteSubtree: false,
    },
    public disabled = false
  ) {}

  isSelectable() {
    return (
      !this.disabled ||
      this.permission?.canOnlyWriteSubtree ||
      this.permission?.canRead
    );
  }
}

export class TreeAction {
  constructor(public type: TreeActionType, public id: number) {}
}
