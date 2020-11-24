import {Injectable} from '@angular/core';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {FlatTreeControl} from '@angular/cdk/tree';
import {CollectionViewer, SelectionChange, SelectionModel} from '@angular/cdk/collections';
import {map, tap} from 'rxjs/operators';
import {DocumentAbstract} from '../../../store/document/document.model';
import {DynamicDatabase} from './dynamic.database';
import {TreeService} from './tree.service';

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

  get data(): TreeNode[] {
    return this.dataChange.value;
  }

  set data(value: TreeNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(private _treeControl: FlatTreeControl<TreeNode>,
              private _database: DynamicDatabase,
              private treeService: TreeService,
              private selectionModel: SelectionModel<TreeNode>) {
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

      this.expandNode(node);

    } else if (!expand && node.isExpanded) {

      this.collapseNode(node, index);

    }
  }

  private expandNode(node: TreeNode) {
    node.isLoading = true;
    this._database.getChildren(node._id, false, this.forAddress)
      .pipe(
        map(docs => this._database.mapDocumentsToTreeNodes(docs, node.level + 1)),
        map(docs => docs.sort(this.treeService.getSortTreeNodesFunction())),
        tap(docs => {
          if (this.selectionModel.isSelected(node)) {
            this.selectionModel.select(...docs);
          }
        })
      )
      .subscribe(children => {

        const index = this.data.findIndex(item => item === node);

        if (children) {
          // mark node after children to set border-top correctly
          const nextIndex = index + 1;
          if (this.data.length > nextIndex) {
            this.data[nextIndex].afterExpanded = true;
          }

          this.data.splice(nextIndex, 0, ...children);
          node.isLoading = false;
          node.isExpanded = true;
          // notify the change
          this.dataChange.next(this.data);
        }

      });
  }

  private collapseNode(node: TreeNode, index: number) {
    if (!node) {
      return;
    }

    let count = 0;
    const nextIndex = index + 1;
    for (let i = nextIndex; i < this.data.length && this.data[i].level > node.level; i++, count++) {
    }
    this.data.splice(nextIndex, count);

    // remove mark of node when upper children have been removed to set border-top correctly
    if (this.data.length > nextIndex) {
      this.data[nextIndex].afterExpanded = false;
    }

    this.dataChange.next(this.data);
    node.isExpanded = false;
  }

  removeNode(doc: TreeNode) {
    const index = this.data.indexOf(doc);

    if (index !== -1) {
      // make sure to collapse node so that all children are removed as well
      this._treeControl.collapse(doc);

      this.data.splice(index, 1);
      this.dataChange.next(this.data);
    }
  }

  updateNode(docs: DocumentAbstract[]) {
    docs.forEach(doc => {
      const index = this.data?.findIndex(node => node._id === doc.id);

      // in case we save unsaved changes before leaving the page
      if (index === undefined) {
        return;
      }

      this.collapseNode(this.data[index], index);

      if (index !== -1) {
        const level = this.data[index].level;
        this.data.splice(index, 1);
        const updatedNode = this._database.mapDocumentsToTreeNodes([doc], level)[0];
        this.insertNodeInTree(updatedNode, updatedNode.parent);
      }
    });
  }

  /**
   * Insert a tree node under a parent in a correctly sorted way.
   * @param node
   * @param dest
   */
  insertNodeInTree(node: TreeNode, dest: string) {

    // in case the new parent was collapsed, the moved nodes are automatically
    // loaded from the backend when expanding the parent
    const alreadyPresent = this.data.find(item => item._id === node._id);
    if (alreadyPresent) {
      return;
    }

    node.parent = dest;

    let destNodeLevel;
    let destNodeIndex;

    if (dest === null) {
      destNodeLevel = -1;
      destNodeIndex = -1;
    } else {
      destNodeIndex = this.data.findIndex(item => item._id === dest);

      const destNode = this.data[destNodeIndex];
      destNodeLevel = destNode.level;

      if (!destNode.isExpanded) {
        // TODO: we should expand with update from server here!
        this.expandNode(destNode);
        return;
      }
    }
    node.level = destNodeLevel + 1;

    // get all children nodes from destination
    let childrenNodes = [node];
    const childrenNodesWithExpanded = [];
    for (let i = destNodeIndex + 1; i < this.data.length && this.data[i].level > destNodeLevel; i++) {
      childrenNodesWithExpanded.push(this.data[i]);
      if (this.data[i].level === destNodeLevel + 1) {
        childrenNodes.push(this.data[i]);
      }
    }

    // sort children nodes
    childrenNodes = childrenNodes.sort(this.treeService.getSortTreeNodesFunction());

    // get index of sorted moved node
    const sortedMovedNodeIndex = childrenNodes.findIndex(item => item._id === node._id);

    const atEnd = sortedMovedNodeIndex === childrenNodes.length - 1;
    let count = 0;

    if (atEnd) {

      this.data.splice(destNodeIndex + 1 + childrenNodesWithExpanded.length, 0, node);

    } else {

      const successor = childrenNodes[sortedMovedNodeIndex + 1]._id;
      for (let i = destNodeIndex + 1; i < this.data.length && this.data[i]._id !== successor; i++, count++) {
      }
      this.data.splice(destNodeIndex + 1 + count, 0, node);

    }

    this.dataChange.next(this.data);

  }


  addRootNode(doc: DocumentAbstract) {

    const docAsTreeNode = this._database.mapDocumentsToTreeNodes([doc], 0);

    const indexOfPreviousNodeInTree = this.getIndexToInsertNode(docAsTreeNode, doc);

    this.data.splice(indexOfPreviousNodeInTree, 0, ...docAsTreeNode);
    this.dataChange.next(this.data);
  }

  private getIndexToInsertNode(docAsTreeNode: TreeNode[], doc: DocumentAbstract): number {
    // FIXME: during tests it happened that a new document was created before tree loaded root nodes
    if (!this.data) {
      return 0;
    }

    // get calculated position with only root nodes (using sort method)
    let indexOfNewDoc = this.data
      .filter(document => document.level === 0)
      .concat(docAsTreeNode)
      .sort(this.treeService.getSortTreeNodesFunction())
      .findIndex(document => document._id === doc.id);

    // if node has children, make sure to insert AFTER those
    while (this.data[indexOfNewDoc] && this.data[indexOfNewDoc].level > 0) {
      indexOfNewDoc++;
    }

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
