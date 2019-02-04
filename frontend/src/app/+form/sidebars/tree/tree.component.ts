import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from "../../../store/tree/tree-node.model";
import {DocumentAbstract} from "../../../store/document/document.model";
import {DynamicDatabase} from "./DynamicDatabase";
import {TreeQuery} from "../../../store/tree/tree.query";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material";
import {DocumentService} from "../../../services/document/document.service";
import {Observable, of, Subject} from "rxjs";

@Component({
  selector: 'ige-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
  providers: [DynamicDatabase]
})
export class MetadataTreeComponent implements OnInit {

  @Input() showFolderEditButton = true;
  @Input() data: Observable<DocumentAbstract[]>;
  @Input() expandedNodeIds: Observable<string[]>;
  @Output() toggle = new EventEmitter<{parentId: string, expand: boolean}>();
  @Output() selected = new EventEmitter<string[]>();
  @Output() activate = new EventEmitter<DocumentAbstract[]>();

  private transformer = (doc: DocumentAbstract, level: number) => {
    return <TreeNode>{
      _id: doc._id,
      title: doc.title ? doc.title : 'Kein Titel',
      state: doc._state,
      hasChildren: doc._hasChildren,
      level: level
    };
  };

  treeControl = new FlatTreeControl<TreeNode>(
    node => node.level, node => node.hasChildren);

  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.hasChildren, node => node._children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  private isLoading: TreeNode;
  private dataMap: any = {};

  constructor() {}

  ngOnInit(): void {
    this.data.subscribe( docs => {
      this.dataSource.data = docs;
      this.isLoading = null;
    });

    this.expandedNodeIds.subscribe(ids => {
      this.treeControl.expansionModel.clear();

      let nodesToExpand: TreeNode[] = this.treeControl.dataNodes.filter( node => ids.indexOf(node._id) !== -1);
      this.treeControl.expansionModel.select(...nodesToExpand);
    });
  }

  hasChild = (_: number, node: TreeNode) => {
    return node.hasChildren;
  };

  selectNode(node: TreeNode) {
    // deselect all nodes first
    this.treeControl.dataNodes.forEach(node => node.isSelected = false);

    // set selection state to new node
    node.isSelected = true;

    this.selected.next([node._id]);

    let docs = this.dataSource.data.filter( n => n._id === node._id);
    this.activate.next(docs);
  }

  toggleNode(node: TreeNode) {
    const isExpanded = this.treeControl.isExpanded(node);

    if (isExpanded) {
      if (this.dataMap[node._id]) {
        // return of(this.dataMap[node._id]).toPromise();
      }
      this.isLoading = node;
    }

    this.toggle.next({
      parentId: node._id,
      expand: isExpanded
    });
  }

  /**
   * Improve rendering speed so that we only render modified nodes.
   * @param index
   * @param item
   */
  trackByNodeId(index, item: TreeNode) {
    return item._id;
  }

  add() {
    // this.dataSource.data.push({title: 'New node', _id: '999', hasChildren: false, level: 0, state: 'W', profile: 'ADDRESS', parent: '', iconClass: null});
    // this.dataSource.dataChange.next(this.dataSource.data);
  }
}
