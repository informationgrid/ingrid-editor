import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {DocumentAbstract} from '../../../store/document/document.model';
import {DynamicDatabase} from './DynamicDatabase';
import {Observable} from 'rxjs';
import {ArrayDataSource} from '@angular/cdk/collections';

@Component({
  selector: 'ige-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  providers: [DynamicDatabase]
})
export class MetadataTreeComponent implements OnInit {

  @Input() showFolderEditButton = true;
  @Input() data: Observable<any[]>;
  @Input() expandedNodeIds: Observable<string[]>;
  @Input() initialExpandedNodeIds: string[];
  @Input() selectedIds: Observable<string[]>;
  @Input() transform: (data: any[], level: number, parent: string, expandState: any, initialState: any) => TreeNode[];

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
   * The datasource is used by the mat-tree component to build the tree
   */
  // dataSource: Observable<TreeNode[]>;
  dataSource: ArrayDataSource<TreeNode>;

  // signal to show that a tree node is loading
  private isLoading: TreeNode;

  // store all nodes where we can find the nested items
  private allData: DocumentAbstract[];
  private copy: TreeNode[] = [];

  constructor() {}

  ngOnInit(): void {

    // listen to external node changes and update connected datasource
    this.data.subscribe(docs => {
      this.updateTreeNodes(docs);
    });

    // react on external ui changes (expand/collapse)
    /*this.expandedNodeIds.subscribe(ids => {
      /!*this.treeControl.expansionModel.clear();
      this.isLoading = null;

      const nodesToExpand: TreeNode[] = this.copy.filter(node => ids.indexOf(node._id) !== -1);
      this.treeControl.expansionModel.select(...nodesToExpand);*!/
      console.log('expanded nodes', this.copy.filter(d => ids.indexOf(d._id) !== -1));
      this.treeControl.expansionModel.select(...this.copy.filter(d => ids.indexOf(d._id) !== -1));
    });*/

    // react on external selection changes
    this.selectedIds.subscribe(ids => this.copy.forEach((node) => {
      if (ids.indexOf(node._id) !== -1) {
        node.isSelected = true;
      }
    }));

  }

  getExpandableState(): any {
    return this.copy
      .reduce((obj, item) => {
        obj[item._id] = item.isExpanded;
        return obj
      }, {});
  }

  updateTreeNodes(data) {
    const expandState = this.getExpandableState();
    this.copy = this.transform(data, 0, null, expandState, this.initialExpandedNodeIds);
    this.dataSource = new ArrayDataSource(this.copy);

    this.treeControl.expansionModel.select(...this.copy.filter(d => d.isExpanded));
  }

  /**
   *
   * @param node
   */
  toggleNode(node: TreeNode) {

    const isExpanded = this.treeControl.isExpanded(node);

    if (isExpanded) {
      // this.isLoading = node;
    }

    node.isExpanded = isExpanded;

    this.toggle.next({
      parentId: node._id,
      expand: isExpanded
    });

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
    this.copy.forEach(n => n.isSelected = false);

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

  getParentNode(node: TreeNode) {
    const nodeIndex = this.copy.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (this.copy[i].level === node.level - 1) {
        return this.copy[i];
      }
    }

    return null;
  }

  shouldRender(node: TreeNode) {
    const parent = this.getParentNode(node);
    return !parent || parent.isExpanded;
  }

}
