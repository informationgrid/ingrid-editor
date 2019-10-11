import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {combineLatest, Observable, of} from 'rxjs';
import {ArrayDataSource} from '@angular/cdk/collections';

@Component({
  selector: 'ige-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class MetadataTreeComponent implements OnInit {

  // @Input() showFolderEditButton = true;
  @Input() data: Observable<TreeNode[]>;
  @Input() initialExpandedNodeIds: string[] = [];
  @Input() selectedIds: Observable<string[]>;
  @Input() showReloadButton = false;
  @Input() initialActiveNodeId: string = null;

  /**
   * A function to determine if a tree node should be disabled.
   */
  @Input() disabledCondition: (TreeNode) => boolean = () => {
    return false;
  };

  @Output() toggle = new EventEmitter<{ parentId: string, expand: boolean }>();
  @Output() selected = new EventEmitter<string[]>();
  @Output() activate = new EventEmitter<string[]>();
  @Output() reload = new EventEmitter<null>();

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
  dataSource: ArrayDataSource<TreeNode>;

  // signal to show that a tree node is loading
  private isLoading: TreeNode;

  // store all nodes where we can find the nested items
  private copy: TreeNode[] = [];

  constructor() {
  }

  ngOnInit(): void {

    if (this.selectedIds === undefined) {
      this.selectedIds = of([]);
    }
    // listen to external node changes (tree nodes and selection state) and update connected datasource
    combineLatest([
      this.data,
      this.selectedIds
    ]).subscribe(([data, selection]) => {
      this.updateTreeNodes(data);
      if (data.length > 0) {
        this.markSelectedNodes(selection);
      }
    });

  }

  private markSelectedNodes(ids: string[]) {
    this.copy.forEach((node) => node.isSelected = ids.indexOf(node._id) !== -1);
  }

  private getState(type: 'isExpanded' | 'isSelected'): any {
    return this.copy
      .reduce((obj, item) => {
        obj[item._id] = item[type];
        return obj
      }, {});
  }

  private transform(data: TreeNode[], level: number, parent: string, expandState: any, selectState: any) {
    const finalArray = [];

    data
      .filter(d => d.parent === parent)
      .map(d => {
        return {
          ...d,
          level: level,
          isSelected: selectState[d._id],
          isExpanded: expandState[d._id]
        } as TreeNode;
      })
      .forEach(p => {
        finalArray.push(p);
        if (p.hasChildren) {
          const children = this.transform(data, level + 1, p._id, expandState, selectState);
          if (children.length > 0) {
            finalArray.push(...children);
          }
        }
      });

    return finalArray;
  }

  private updateTreeNodes(data: TreeNode[]) {
    const expandState = {...this.getState('isExpanded'), ...this.initialExpandedNodeIds};
    const selectState = {...this.getState('isSelected')};
    this.copy = this.transform(data, 0, null, expandState, selectState);
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
   * @param $event
   */
  selectNode(node: TreeNode, $event: MouseEvent) {

    // deselect all nodes first
    // TODO: handle shiftKey
    let selectedIds = [];
    if ($event.ctrlKey) {
      selectedIds = this.copy
        .filter(n => n.isSelected)
        .map(n => n._id);
    }

    // set selection state to new node
    // toggle state if ctrl-key is pressed, otherwise selected
    if ($event.ctrlKey && node.isSelected) {
      // deselect
      selectedIds.splice(selectedIds.indexOf(node._id), 1);
    } else {
      selectedIds.push(node._id);

      if (selectedIds.length === 1) {
        this.initialActiveNodeId = node._id;
        this.activate.next([node._id]);
      }

      if (node.hasChildren) {
        this.treeControl.toggle(node);
        this.toggleNode(node);
      }

    }

    this.selected.next(selectedIds);

  }

  private getParentNode(node: TreeNode) {
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

  reloadTree() {
    this.reload.next();
  }
}
