import {Injectable} from '@angular/core';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {FlatTreeControl} from '@angular/cdk/tree';
import {CollectionViewer, SelectionChange} from '@angular/cdk/collections';
import {map} from 'rxjs/operators';
import {DocumentAbstract} from '../../../store/document/document.model';
import {DynamicDatabase} from './dynamic.database';

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
@Injectable()
export class DynamicDataSource {

  dataChange = new BehaviorSubject<TreeNode[]>(null);

  get data(): TreeNode[] {
    return this.dataChange.value;
  }

  set data(value: TreeNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(private _treeControl: FlatTreeControl<TreeNode>,
              private _database: DynamicDatabase) {
  }

  connect(collectionViewer: CollectionViewer): Observable<TreeNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
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
    const index = this.data.indexOf(node);
    if (index === -1) {
      console.warn('Node not found');
      return;
    }
    if (expand && !node.isExpanded) {
      this._database.getChildren(node._id)
        .pipe(
          map(docs => this._database.mapDocumentsToTreeNodes(docs, node.level + 1))
        ).subscribe(children => {
        if (!children || index < 0) { // If no children, or cannot find the node, no op
          return;
        }

        node.isLoading = true;

        // const nodes = children.map(child =>
        //   new TreeNode(name, node.profile, node.level + 1, this._database.isExpandable(name)));
        this.data.splice(index + 1, 0, ...children);
        node.isLoading = false;
        node.isExpanded = true;
        // notify the change
        this.dataChange.next(this.data);
      });
    } else if (!expand && node.isExpanded) {
      let count = 0;
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {
      }
      this.data.splice(index + 1, count);
      this.dataChange.next(this.data);
      node.isExpanded = false;
    }
  }

  removeNode(docs: DocumentAbstract[]) {
    docs.forEach(doc => {
      const index = this.data.findIndex(node => node._id === doc.id);
      if (index !== -1) {
        this.data.splice(index, 1);
        this.dataChange.next(this.data);
      }
    });
  }

  updateNode(docs: DocumentAbstract[]) {
    docs.forEach(doc => {
      const index = this.data.findIndex(node => node._id === doc.id);
      if (index !== -1) {
        this.data.splice(index, 1, ...this._database.mapDocumentsToTreeNodes([doc], this.data[index].level));
        this.dataChange.next(this.data);
      }
    });
  }

  addNode(parent: string, docs: DocumentAbstract[]) {
    const index = this.data.findIndex(node => node._id === parent);
    let childLevel = 0;
    if (parent) {
      childLevel = this.data[index].level + 1;
    }
    this.data.splice(index + 1, 0, ...this._database.mapDocumentsToTreeNodes(docs, childLevel));
    this.dataChange.next(this.data);
  }
}
