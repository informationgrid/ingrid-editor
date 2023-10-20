import { DocumentState } from "../../models/ige-document";

export class TreeNode {
  isExpanded?: boolean;
  afterExpanded?: boolean;

  constructor(
    public _id: number,
    public _uuid: string,
    public title: string = "Kein Titel",
    public type: string,
    public state: DocumentState = null,
    public level = 1,
    public hasChildren = false,
    public parent: number = null,
    public iconClass: string = "Fachaufgabe",
    public isLoading = false,
    public hasWritePermission = false,
    public hasOnlySubtreeWritePermission = false,
    public tags: string = null,
  ) {}
}
