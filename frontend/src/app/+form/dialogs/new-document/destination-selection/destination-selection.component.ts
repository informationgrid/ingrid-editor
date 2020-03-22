import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TreeNode} from "../../../../store/tree/tree-node.model";
import {of, Subject} from "rxjs";
import {DocumentAbstract} from "../../../../store/document/document.model";

@Component({
  selector: 'ige-destination-selection',
  templateUrl: './destination-selection.component.html',
  styleUrls: ['./destination-selection.component.scss']
})
export class DestinationSelectionComponent implements OnInit {

  @Input() forAddress: boolean;
  @Output() choice = new EventEmitter();

  parent: string = null;
  path: string[] = [];
  rootNode: Partial<DocumentAbstract>;
  activeTreeNode = new Subject<string>();
  activeListItem = new Subject<DocumentAbstract>();

  constructor() {
  }

  ngOnInit(): void {
    if (this.forAddress) {
      this.rootNode = {
        id: null,
        title: 'Adressen',
        icon: 'Ordner'
      }
    } else {
      this.rootNode = {
        id: null,
        title: 'Daten',
        icon: 'Ordner'
      }
    }
  }

  disabledCondition(node: TreeNode) {
    return node.profile !== 'FOLDER';
  }

  updateParent(node: string[], source: 'Tree' | 'List') {
    this.parent = node[0];

    if (source === 'List') {
      this.activeTreeNode.next(null);
      this.path = [this.rootNode.title];
    } else {
      this.activeListItem.next(null);
    }

    this.choice.next({
      parent: this.parent,
      path: this.path
    });
  }

  getRootNode() {
    return of([this.rootNode]);
  }

  updatePath(path: string[]) {
    this.path = path;
    this.updateParent([this.parent], 'Tree');
  }
}
