import {Injectable} from '@angular/core';
import {BehaviorSubject, merge, Observable} from "rxjs";
import {FlatTreeControl} from "@angular/cdk/tree";
import {DynamicDatabase} from "./DynamicDatabase";
import {CollectionViewer, SelectionChange} from "@angular/cdk/collections";
import {TreeNode} from "../../../store/tree/tree-node.model";
import {map} from "rxjs/operators";

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
@Injectable()
export class DynamicDataSource {

  dataChange = new BehaviorSubject<TreeNode[]>([]);

  get data(): TreeNode[] {
    return this.dataChange.value;
  }

  set data(value: TreeNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(private treeControl: FlatTreeControl<TreeNode>,
              private database: DynamicDatabase) {
  }

  connect(collectionViewer: CollectionViewer): Observable<TreeNode[]> {
    this.treeControl.expansionModel.changed.subscribe(change => {
      if ((change as SelectionChange<TreeNode>).added ||
        (change as SelectionChange<TreeNode>).removed) {
        this.handleTreeControl(change as SelectionChange<TreeNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<TreeNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: TreeNode, expand: boolean) {
    const childrenPromise = this.database.getChildren(node._id, node.level + 1);
    const index = this.data.indexOf(node);

    node.isLoading = true;

    return childrenPromise.subscribe((children) => {
      if (!children || index < 0) { // If no children, or cannot find the node, no op
        return;
      }
      if (expand) {
        this.data.splice(index + 1, 0, ...children);
      } else {
        let count = 0;

        // count children that has to be removed from flat list
        for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {}

        this.data.splice(index + 1, count);
      }

      // notify the change
      this.dataChange.next(this.data);
      node.isLoading = false;
      return children;
    });
  }
}
