import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { BehaviorSubject, of } from "rxjs";
import {
  ADDRESS_ROOT_NODE,
  DOCUMENT_ROOT_NODE,
  DocumentAbstract,
} from "../../../../store/document/document.model";
import { DocBehavioursService } from "../../../../services/event/doc-behaviours.service";

@Component({
  selector: "ige-destination-selection",
  templateUrl: "./destination-selection.component.html",
  styleUrls: ["./destination-selection.component.scss"],
})
export class DestinationSelectionComponent implements OnInit {
  @Input() forAddress: boolean;
  @Input() disableRoot = false;
  @Output() choice = new EventEmitter<string>();
  parent: string = null;
  rootNode: Partial<DocumentAbstract>;
  activeTreeNode = new BehaviorSubject<string>(null);
  activeListItem = new BehaviorSubject<Partial<DocumentAbstract>>(undefined);
  showOnlyFolders: boolean;

  constructor(private docBehaviours: DocBehavioursService) {}

  @Input() set initialSelectedId(value: string) {
    if (value !== null) this.activeTreeNode.next(value);
  }

  ngOnInit(): void {
    if (this.forAddress) {
      this.rootNode = ADDRESS_ROOT_NODE;
    } else {
      this.rootNode = DOCUMENT_ROOT_NODE;
    }

    this.showOnlyFolders =
      this.docBehaviours.showOnlyFoldersInTreeForDestinationSelection(
        this.forAddress
      );

    this.activeListItem.next(this.rootNode);
  }

  disabledCondition() {
    return (node: TreeNode) => {
      return this.docBehaviours.cannotAddDocumentBelow()(this.forAddress, node);
    };
  }

  updateParent(node: string[], source: "Tree" | "List") {
    this.parent = node[0] ?? null;

    if (source === "List") {
      this.activeTreeNode.next(null);
    } else {
      this.activeListItem.next(null);
    }

    this.choice.next(this.parent);
  }

  getRootNode() {
    return of([this.rootNode]);
  }
}
