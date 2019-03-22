import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from "../../../store/tree/tree-node.model";
import {DocumentAbstract} from "../../../store/document/document.model";
import {DynamicDatabase} from "./DynamicDatabase";
import {TreeQuery} from "../../../store/tree/tree.query";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material";
import {Observable} from "rxjs";

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
  @Input() selectedIds: Observable<string[]>;

  @Output() toggle = new EventEmitter<{parentId: string, expand: boolean}>();
  @Output() selected = new EventEmitter<string[]>();
  @Output() activate = new EventEmitter<string[]>();

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
    this.transformer, node => node.level, node => node.hasChildren,
      node => {
        return this.treeQuery.getAll({ filterBy: entity => entity._parent === node._id});
      });

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  private isLoading: TreeNode;

  constructor(private treeQuery: TreeQuery) {}

  ngOnInit(): void {
    this.data.subscribe( docs => {
      // only get root nodes, the children will be received through the getChildren function
      // calling treeQuery
      this.dataSource.data = docs.filter( doc => doc._parent === null);
      this.isLoading = null;
    });

    this.expandedNodeIds.subscribe(ids => {
      this.treeControl.expansionModel.clear();
      this.isLoading = null;

      let nodesToExpand: TreeNode[] = this.treeControl.dataNodes.filter( node => ids.indexOf(node._id) !== -1);
      this.treeControl.expansionModel.select(...nodesToExpand);
    });

    this.selectedIds.subscribe( ids => this.treeControl.dataNodes.forEach((node) => {
      if (ids.indexOf(node._id) !== -1) {
        node.isSelected = true;
      }
    }))
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

    // the data in dataSource only contains root nodes!!!
    // let docs = this.dataSource.data.filter( n => n._id === node._id);
    this.activate.next([node._id]);

    if (node.hasChildren) {
      this.toggleNode(node);
      this.treeControl.expand(node);
    }
  }

  toggleNode(node: TreeNode) {
    const isExpanded = this.treeControl.isExpanded(node);

    if (isExpanded) {
      this.isLoading = node;
    }

    // clear selection state again since it's set again through store
    // this.treeControl.collapse(node);

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

  /*isExpanded(node: TreeNode): Promise<boolean> {
    this.treeControl.
    setTimeout( () => {
      return this.treeControl.isExpanded(node);
    }, 1000);
  }*/
}
