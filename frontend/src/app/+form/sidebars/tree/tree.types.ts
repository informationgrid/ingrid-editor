import { TreeActionType } from "./tree.component";

export class ShortTreeNode {
  constructor(
    public id: string,
    public title: string,
    public hasOnlySubtreeWritePermission = false,
    public disabled = false
  ) {}
}

export class TreeAction {
  constructor(public type: TreeActionType, public id: string) {}
}
