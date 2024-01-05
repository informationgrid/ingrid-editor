/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Injectable } from "@angular/core";
import { BehaviorSubject, merge, Observable, Subject } from "rxjs";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { FlatTreeControl } from "@angular/cdk/tree";
import {
  CollectionViewer,
  DataSource,
  SelectionChange,
} from "@angular/cdk/collections";
import { map } from "rxjs/operators";
import { DocumentAbstract } from "../../../store/document/document.model";
import { DynamicDatabase } from "./dynamic.database";
import { TreeService } from "./tree.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
@UntilDestroy()
@Injectable()
export class DynamicDataSource extends DataSource<TreeNode> {
  dataChange = new BehaviorSubject<TreeNode[]>(null);
  nodeExpanded$ = new Subject<number>();

  private forAddress = false;

  get data(): TreeNode[] {
    return this.dataChange.value;
  }

  set data(value: TreeNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<TreeNode>,
    private _database: DynamicDatabase,
    private treeService: TreeService,
  ) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<TreeNode[]> {
    this._treeControl.expansionModel.changed
      .pipe(untilDestroyed(this))
      .subscribe((change) => {
        if (
          (change as SelectionChange<TreeNode>).added ||
          (change as SelectionChange<TreeNode>).removed
        ) {
          this.handleTreeControl(change as SelectionChange<TreeNode>);
        }
      });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data),
    );
  }

  disconnect(collectionViewer: CollectionViewer) {}

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<TreeNode>) {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: TreeNode, expand: boolean) {
    const index = this.data.indexOf(node);
    if (index === -1) {
      console.warn("Node not found");
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
    this._database
      .getChildren(node._id, false, this.forAddress)
      .pipe(
        map((docs) =>
          this._database.mapDocumentsToTreeNodes(docs, node.level + 1),
        ),
        map((docs) => docs.sort(this.treeService.getSortTreeNodesFunction())),
        /*tap(docs => {
          if (this.selectionModel.isSelected(node)) {
            this.selectionModel.select(...docs);
          }
        })*/
      )
      .subscribe((children) => {
        const index = this.data.findIndex((item) => item === node);

        // not children length > 0 since we need the dataChange event for expansion handling
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
        this.nodeExpanded$.next(node._id);
      });
  }

  private collapseNode(node: TreeNode, index: number) {
    if (!node) {
      return;
    }

    let count = 0;
    const nextIndex = index + 1;
    for (
      let i = nextIndex;
      i < this.data.length && this.data[i].level > node.level;
      i++, count++
    ) {}
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
    docs.forEach((doc) => {
      const index = this.data?.findIndex((node) => node._id === doc.id);

      // in case we save unsaved changes before leaving the page
      if (index === undefined || index === -1) {
        return;
      }

      // when title changed the position in tree might change, so we collapse node to move all children along
      const wasExpanded = this.data[index].isExpanded;
      this.collapseNode(this.data[index], index);

      const level = this.data[index].level;
      this.data.splice(index, 1);
      const updatedNode = this._database.mapDocumentsToTreeNodes(
        [doc],
        level,
      )[0];
      this.insertNodeInTree(updatedNode, updatedNode.parent);
      if (wasExpanded) this.expandNode(updatedNode);
    });
  }

  /**
   * Insert a tree node under a parent in a correctly sorted way.
   * @param node
   * @param dest
   */
  insertNodeInTree(node: TreeNode, dest: number) {
    // in case the new parent was collapsed, the moved nodes are automatically
    // loaded from the backend when expanding the parent
    const alreadyPresent = this.data.find((item) => item._id === node._id);
    if (alreadyPresent) {
      return;
    }

    node.parent = dest;

    let destNodeLevel = -1;
    let destNodeIndex = -1;

    if (dest !== null) {
      destNodeIndex = this.data.findIndex((item) => item._id === dest);

      // if parent node cannot be found (e.g. no read access)
      if (destNodeIndex !== -1) {
        const destNode = this.data[destNodeIndex];
        destNodeLevel = destNode.level;

        if (!destNode.isExpanded) {
          // TODO: we should expand with update from server here!
          this.expandNode(destNode);
          return;
        }
      } else {
        console.warn(
          `Could not find parent node "${dest}". Maybe no read access?`,
        );
      }
    }
    node.level = destNodeLevel + 1;

    // get all children nodes from destination
    let childrenNodes = [node];
    const childrenNodesWithExpanded = [];
    for (
      let i = destNodeIndex + 1;
      i < this.data.length && this.data[i].level > destNodeLevel;
      i++
    ) {
      childrenNodesWithExpanded.push(this.data[i]);
      if (this.data[i].level === destNodeLevel + 1) {
        childrenNodes.push(this.data[i]);
      }
    }

    // sort children nodes
    childrenNodes = childrenNodes.sort(
      this.treeService.getSortTreeNodesFunction(),
    );

    // get index of sorted moved node
    const sortedMovedNodeIndex = childrenNodes.findIndex(
      (item) => item._id === node._id,
    );

    const atEnd = sortedMovedNodeIndex === childrenNodes.length - 1;
    let count = 0;

    if (atEnd) {
      this.data.splice(
        destNodeIndex + 1 + childrenNodesWithExpanded.length,
        0,
        node,
      );
    } else {
      const successor = childrenNodes[sortedMovedNodeIndex + 1]._id;
      for (
        let i = destNodeIndex + 1;
        i < this.data.length && this.data[i]._id !== successor;
        i++, count++
      ) {}
      this.data.splice(destNodeIndex + 1 + count, 0, node);
    }

    this.dataChange.next(this.data);
  }

  getNode(nodeId: number): TreeNode {
    return this.data.find((node) => node._id === nodeId);
  }

  setForAddress(forAddresses: boolean) {
    this.forAddress = forAddresses;
  }
}
