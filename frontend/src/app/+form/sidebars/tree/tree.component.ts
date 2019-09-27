import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {DocumentAbstract} from '../../../store/document/document.model';
import {DynamicDatabase} from './DynamicDatabase';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import {Observable} from 'rxjs';

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

  @Output() toggle = new EventEmitter<{ parentId: string, expand: boolean }>();
  @Output() selected = new EventEmitter<string[]>();
  @Output() activate = new EventEmitter<string[]>();

  /**
   * The controller of the tree to identify if a node is expandable
   * and which hierarchy level it is.
   */
  treeControl = new FlatTreeControl<TreeNode>(
    node => node.level,
    node => node.hasChildren);

  /**
   * A flattener function that creates from a nested structure a
   * flat one in the correct order. So nested elements are directly
   * after the parent element.
   */
  treeFlattener = new MatTreeFlattener(
    DynamicDatabase.mapToTreeNode,
    node => node.level,
    node => node.hasChildren,
    node => {
      return this.allData.filter(entity => entity._parent === node.id);
    });

  /**
   * The datasource is used by the mat-tree component to build the tree
   */
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // signal to show that a tree node is loading
  private isLoading: TreeNode;

  // store all nodes where we can find the nested items
  private allData: DocumentAbstract[];

  constructor() {}

  ngOnInit(): void {

    // listen to external node changes and update connected datasource
    this.data.subscribe(docs => {
      // only get root nodes, the children will be received through the getChildren function
      // of the MatTreeFlattener
      this.allData = docs;
      this.dataSource.data = docs.filter(doc => !doc._parent);
      this.isLoading = null;
    });

    // react on external ui changes (expand/collapse)
    this.expandedNodeIds.subscribe(ids => {
      this.treeControl.expansionModel.clear();
      this.isLoading = null;

      const nodesToExpand: TreeNode[] = this.treeControl.dataNodes.filter(node => ids.indexOf(node._id) !== -1);
      this.treeControl.expansionModel.select(...nodesToExpand);
    });

    // react on external selection changes
    this.selectedIds.subscribe(ids => this.treeControl.dataNodes.forEach((node) => {
      if (ids.indexOf(node._id) !== -1) {
        node.isSelected = true;
      }
    }));

  }

  /**
   * Check if a tree node as children. This is used by the HTML-template when building the tree.
   * @param _
   * @param node is the current tree node
   */
  hasChild = (_: number, node: TreeNode) => {

    // return node.hasChildren;
    return node.profile === 'FOLDER';

  };

  /**
   *
   * @param node
   */
  selectNode(node: TreeNode) {

    // deselect all nodes first
    this.treeControl.dataNodes.forEach(n => n.isSelected = false);

    // set selection state to new node
    node.isSelected = true;

    this.selected.next([node._id]);

    // the data in dataSource only contains root nodes!!!
    // let docs = this.dataSource.data.filter( n => n._id === node._id);
    this.activate.next([node._id]);

    if (node.hasChildren) {
      this.treeControl.toggle(node);
      this.toggleNode(node);
    }

  }

  /**
   *
   * @param node
   */
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

}
