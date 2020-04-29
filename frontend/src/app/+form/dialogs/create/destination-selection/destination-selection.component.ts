import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TreeNode} from '../../../../store/tree/tree-node.model';
import {BehaviorSubject, of} from 'rxjs';
import {ADDRESS_ROOT_NODE, DOCUMENT_ROOT_NODE, DocumentAbstract} from '../../../../store/document/document.model';
import {ShortTreeNode} from '../../../sidebars/tree/tree.component';

@Component({
  selector: 'ige-destination-selection',
  templateUrl: './destination-selection.component.html',
  styleUrls: ['./destination-selection.component.scss']
})
export class DestinationSelectionComponent implements OnInit {

  @Input() forAddress: boolean;
  @Input() initialSelectedId: string;
  @Output() choice = new EventEmitter();

  parent: string = null;
  path: ShortTreeNode[] = [];
  rootNode: Partial<DocumentAbstract>;
  activeTreeNode = new BehaviorSubject<string>(null);
  activeListItem = new BehaviorSubject<Partial<DocumentAbstract>>(undefined);

  constructor() {
  }

  ngOnInit(): void {
    if (this.forAddress) {
      this.rootNode = ADDRESS_ROOT_NODE;
    } else {
      this.rootNode = DOCUMENT_ROOT_NODE;
    }

    if (this.initialSelectedId) {
      this.activeTreeNode.next(this.initialSelectedId);
    } else {
      this.activeListItem.next(this.rootNode);
    }
  }

  disabledCondition(node: TreeNode) {
    return node.profile !== 'FOLDER';
  }

  updateParent(node: string[], source: 'Tree' | 'List') {
    this.parent = node[0];

    if (source === 'List') {
      this.activeTreeNode.next(null);
      this.path = [new ShortTreeNode(null, this.rootNode.title)];
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

  updatePath(path: ShortTreeNode[]) {
    this.path = path;
    this.updateParent([this.parent], 'Tree');
  }
}
