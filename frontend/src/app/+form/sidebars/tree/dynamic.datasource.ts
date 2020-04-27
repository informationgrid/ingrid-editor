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

  private forAddress = false;
  sortNodesByFolderFirst = (a: TreeNode, b: TreeNode) => {
    if (a.profile === 'FOLDER' && b.profile === 'FOLDER') {
      return a.title.localeCompare(b.title);
    } else if (a.profile !== 'FOLDER' && b.profile !== 'FOLDER') {
      return a.title.localeCompare(b.title);
    } else if (a.profile === 'FOLDER') {
      return -1;
    } else if (b.profile === 'FOLDER') {
      return 1;
    }
  };

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

      this.expandNode(node, index);

    } else if (!expand && node.isExpanded) {

      this.collapseNode(node, index);

    }
  }

  private expandNode(node: TreeNode, index: number) {
    node.isLoading = true;
    this._database.getChildren(node._id, false, this.forAddress)
      .pipe(
        map(docs => DynamicDatabase.mapDocumentsToTreeNodes(docs, node.level + 1)),
        map(docs => docs.sort(this.sortNodesByFolderFirst))
      )
      .subscribe(children => {

        if (children) {
          this.data.splice(index + 1, 0, ...children);
          node.isLoading = false;
          node.isExpanded = true;
          // notify the change
          this.dataChange.next(this.data);
        }

      });
  }

  private collapseNode(node: TreeNode, index: number) {
    let count = 0;
    for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {
    }
    this.data.splice(index + 1, count);
    this.dataChange.next(this.data);
    node.isExpanded = false;
  }

  removeNode(doc: TreeNode) {
    // docs.forEach(doc => {
      const index = this.data.indexOf(doc);
      if (index !== -1) {
        this.data.splice(index, 1);
        this.dataChange.next(this.data);
      }
    // });
  }

  updateNode(docs: DocumentAbstract[]) {
    docs.forEach(doc => {
      const index = this.data.findIndex(node => node._id === doc.id);
      if (index !== -1) {
        this.data.splice(index, 1, ...DynamicDatabase.mapDocumentsToTreeNodes([doc], this.data[index].level));
        this.dataChange.next(this.data);
      }
    });
  }

  addRootNode(doc: DocumentAbstract) {

    const docAsTreeNode = DynamicDatabase.mapDocumentsToTreeNodes([doc], 0);

    const indexOfPreviousNodeInTree = this.getIndexToInsertNode(docAsTreeNode, doc);

    this.data.splice(indexOfPreviousNodeInTree, 0, ...docAsTreeNode);
    this.dataChange.next(this.data);
  }

  private getIndexToInsertNode(docAsTreeNode: TreeNode[], doc: DocumentAbstract): number {
    // get calculated position with only root nodes (using sort method)
    const indexOfNewDoc = this.data
      .filter(document => document.level === 0)
      .concat(docAsTreeNode)
      .sort(this.sortNodesByFolderFirst)
      .findIndex(document => document._id === doc.id);

    // get index of complete tree with eventually expanded nodes
    return this.data.indexOf(this.data[indexOfNewDoc]);
  }

  getNode(nodeId: string): TreeNode {
    return this.data.find(node => node._id === nodeId);
  }

  setForAddress(forAddresses: boolean) {
    this.forAddress = forAddresses;
  }
}
