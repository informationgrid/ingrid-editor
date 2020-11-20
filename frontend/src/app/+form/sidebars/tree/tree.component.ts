import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {combineLatest, Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {UpdateDatasetInfo} from '../../../models/update-dataset-info.model';
import {UpdateType} from '../../../models/update-type.enum';
import {DynamicDataSource} from './dynamic.datasource';
import {DynamicDatabase} from './dynamic.database';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {TreeService} from './tree.service';
import {DocumentUtils} from '../../../services/document.utils';
import {DragNDropUtils} from './dragndrop.utils';
import {ShortTreeNode} from './tree.types';

export enum TreeActionType {
  ADD, UPDATE, DELETE
}

@UntilDestroy()
@Component({
  selector: 'ige-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  providers: [DynamicDatabase]
})
export class TreeComponent implements OnInit, OnDestroy {

  @Input() forAddresses: boolean;
  @Input() expandNodeIds: Subject<string[]>;
  @Input() showHeader = true;
  @Input() showReloadButton = true;
  @Input() setActiveNode: Subject<string>;
  @Input() update: Observable<any>;
  @Input() showHeaderOptions = true;
  @Input() showOnlyFolders = false;
  @Input() enableDrag = false;

  /** The selection for checklist */
  @Output() selected = this.treeService.selectionModel.changed.pipe(
    map(data => data.source.selected.map(item => item._id))
  );
  @Output() activate = new EventEmitter<string[]>();
  @Output() currentPath = new EventEmitter<ShortTreeNode[]>();
  @Output() dropped = new EventEmitter<any>();

  @ViewChild('treeComponent', {read: ElementRef}) treeContainerElement: ElementRef;

  // signal to show that a tree node is loading
  private isLoading: TreeNode;
  activeNode: TreeNode = null;
  activeNodeId: string = null;

  treeControl: FlatTreeControl<TreeNode>;

  dataSource: DynamicDataSource;

  dragManager: DragNDropUtils;
  isDragging = false;

  showMultiSelectionMode = false;

  /**
   * A function to determine if a tree node should be disabled.
   */
  @Input() disabledCondition: (TreeNode) => boolean = () => {
    return false;
  };


  constructor(private database: DynamicDatabase, private treeService: TreeService) {
    this.treeControl = new FlatTreeControl<TreeNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database, treeService);
    this.dragManager = new DragNDropUtils(this.treeControl);
  }

  getLevel = (node: TreeNode) => node.level;

  isExpandable = (node: TreeNode) => node.hasChildren;

  ngOnInit(): void {
    this.dataSource.setForAddress(this.forAddresses);

    // make sure the tree with root nodes is loaded before we start
    // expanding the path if any
    this.handleTreeExpandToInitialNode();

    this.database.treeUpdates
      .pipe(untilDestroyed(this))
      .subscribe(data => this.handleUpdate(data));

  }

  private handleActiveNodeSubscription() {
    if (!this.setActiveNode) {
      return;
    }

    this.setActiveNode
      .pipe(untilDestroyed(this))
      .subscribe(id => {
        if (this.activeNodeId === id) {
          return;
        }
        this.jumpToNode(id)
          .then(() => this.activeNodeId = id);
      });
  }

  private expandOnDataChange(ids: string[]): Promise<void> {
    let resolveNextTime = false;
    let nextId = null;

    // FIXME: if a root node is opened and we want to create a folder and in the dialog we
    //        search for a sub folder of the opened folder, then root nodes will always be
    //        triggered by dataChange, which mixes up resolveNextTime timing

    return new Promise(resolve => {
      const changeObserver = this.dataSource.dataChange.subscribe(data => {
        if (resolveNextTime) {
          setTimeout(() => changeObserver.unsubscribe(), 0);
          resolve();
          return;
        }
        if (data === null) {
          return;
        }

        if (ids.length > 0) {
          nextId = ids.shift();
          const nodeToExpand = data.filter(node => node._id === nextId)[0];
          this.treeControl.expand(nodeToExpand);
        }
        if (ids.length === 0) {
          const folderAlreadyExpanded = data.find(d => d.parent === nextId) !== undefined;
          if (folderAlreadyExpanded) {
            setTimeout(() => changeObserver.unsubscribe(), 0);
            resolve();
          }
          resolveNextTime = true;
        }
      });
    });
  }

  /**
   * Check if a tree node as children. This is used by the HTML-template when building the tree.
   * @param _
   * @param node is the current tree node
   */
  isFolder = (_: number, node: TreeNode) => {

    // return node.hasChildren;
    return node.type === 'FOLDER';

  };

  /**
   *
   * @param node
   * @param $event
   */
  selectNode(node: TreeNode, $event: MouseEvent) {

    if (this.showMultiSelectionMode) {
      this.handleMultiSelection(node);
    } else {
      if ($event.ctrlKey) {
        this.treeService.selectionModel.toggle(node);
      }
      this.handleSingleSelection(node);
    }
  }

  private handleSingleSelection(node: TreeNode) {

    // deselect all nodes first
    this.treeService.selectionModel.clear();
    this.treeService.selectionModel.select(node);
    this.activeNode = this.treeService.selectionModel.selected[0];
    this.activeNodeId = this.treeService.selectionModel.selected[0]._id;
    this.activate.next([this.activeNodeId]);

    // set path in tree for bread crumb (extract to method)
    const path = this.getTitlesFromNodePath(node);
    this.currentPath.next(path);

    if (node.hasChildren) {
      this.treeControl.toggle(node);
    }

  }

  private handleMultiSelection(node: TreeNode) {
    if (this.isFolder(null, node)) {
      this.folderSelectionToggle(node);
    } else {
      this.nodeSelectionToggle(node);
    }
  }

  private getTitlesFromNodePath(node: TreeNode): ShortTreeNode[] {
    if (!node) {
      return null;
    }
    const path = [new ShortTreeNode(node._id, node.title)];
    let parent = node.parent;
    while (parent !== null && parent !== undefined) {
      const parentNode = this.dataSource.getNode(parent);
      parent = parentNode.parent;
      path.push(new ShortTreeNode(parentNode._id, parentNode.title));
    }
    return path.reverse();
  }

  private getParentNode(node: TreeNode): { node: TreeNode, parent: TreeNode } {
    const nodeIndex = this.dataSource.data.findIndex(item => item._id === node._id);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (this.dataSource.data[i].level === node.level - 1) {
        return {node: node, parent: this.dataSource.data[i]};
      }
    }

    return {node: node, parent: null};
  }

  reloadTree(forceFromServer = false): Observable<TreeNode[]> {
    return this.database.initialData(forceFromServer, this.forAddresses)
      .pipe(
        map(docs => this.database.mapDocumentsToTreeNodes(docs, 0)),
        map(docs => docs.sort(this.treeService.getSortTreeNodesFunction())),
        tap(rootElements => {
          this.dataSource.data = rootElements;
          this.treeService.selectionModel.clear();
          if (this.activeNodeId) {
            this.jumpToNode(this.activeNodeId);
          }
        })
      );
  }

  /**
   * Improve rendering speed so that we only render modified nodes.
   * @param index
   * @param item
   */

  /*trackByNodeId(index, item: TreeNode) {
    return item._id;
  }*/

  private handleUpdate(updateInfo: UpdateDatasetInfo) {
    switch (updateInfo.type) {
      case UpdateType.New:
        return this.addNewNode(updateInfo);
      case UpdateType.Update:
        return this.dataSource.updateNode(updateInfo.data);
      case UpdateType.Delete:
        this.deleteNode(updateInfo);
        return;
      case UpdateType.Move:
        const srcDocIds = updateInfo.data.map(doc => <string>doc.id);
        this.moveNodes(srcDocIds, updateInfo.parent);
        return;
      default:
        throw new Error('Tree Action type not known: ' + updateInfo.type);
    }
  }

  private deleteNode(updateInfo: UpdateDatasetInfo) {
    const treeNodes = updateInfo['data']
      .map(doc => this.dataSource.data.find(item => item._id === doc.id));

    // update parent nodes in case they do not have any children anymore
    treeNodes.forEach(node => this.handleNodeRemoval(node));

  }

  private handleNodeRemoval(node: TreeNode) {
    const nodeInfo = this.getParentNode(node);
    // first collapse nodes to be deleted to make sure all sub nodes are removed
    this.treeControl.collapse(nodeInfo.node);
    this.dataSource.removeNode(nodeInfo.node);
    this.updateChildrenInfo(nodeInfo.parent);
  }

  private async addNewNode(updateInfo: UpdateDatasetInfo) {

    if (!updateInfo.doNotSelect) {
      this.activeNodeId = updateInfo.data[0].id + '';
    }

    if (updateInfo.parent) {

      const parentNodeIndex = this.dataSource.data.findIndex(item => item._id === updateInfo.parent);

      // parent node seems to be nested deeper
      if (parentNodeIndex === -1) {
        console.log('Parent not found, expanding tree nodes: ', updateInfo.path);
        if (this.expandNodeIds) {
          this.expandNodeIds.next(updateInfo.path);
        }
        return;
      }

      // TODO: use function jumpToNode
      this.updateChildrenFromServer(updateInfo.parent, <string>updateInfo.data[0].id, updateInfo.doNotSelect);

    } else {
      const newRootTreeNode = this.database.mapDocumentsToTreeNodes(updateInfo.data, 0);
      this.dataSource.insertNodeInTree(newRootTreeNode[0], null);
      if (!updateInfo.doNotSelect) {
        this.updateNodePath(<string>updateInfo.data[0].id);
      }
      this.scrollToActiveElement();
    }

    // remove selection from previously selected nodes
    if (!updateInfo.doNotSelect) {
      this.treeService.selectionModel.clear();
    }

  }

  private updateChildrenFromServer(parentNodeId: string, id: string, doNotSelect: boolean) {
    if (parentNodeId === null) {
      this.reloadTree(true).subscribe();
      return;
    }

    const parentNodeIndex = this.dataSource.data.findIndex(item => item._id === parentNodeId);
    const parentNode = this.dataSource.data[parentNodeIndex];
    parentNode.hasChildren = true;

    // node will be added automatically when expanded
    const isExpanded = this.treeControl.isExpanded(parentNode);

    this.database.getChildren(parentNodeId, true, this.forAddresses)
      .subscribe((children) => {
        console.log('updated children', children);
        if (isExpanded) {
          this.treeControl.collapse(parentNode);
        }
        this.treeControl.expand(parentNode);
        if (!doNotSelect) {
          this.updateNodePath(id);
          this.scrollToActiveElement();
        }
      });
  }

  private updateNodePath(id: string) {
    const nodePath = this.getTitlesFromNodePath(this.dataSource.getNode(id));
    if (nodePath) {
      this.currentPath.next(nodePath);
    }
  }

  private updateChildrenInfo(parentNode: TreeNode) {
    if (parentNode) {
      const index = this.dataSource.data.indexOf(parentNode);
      let count = 0;
      for (let i = index + 1; i < this.dataSource.data.length && this.dataSource.data[i].level > parentNode.level; i++, count++) {
      }
      parentNode.hasChildren = count !== 0;

      if (!parentNode.hasChildren) {
        // this.dataSource.toggleNode(parentNode, false);
        this.treeControl.collapse(parentNode);
      }
    }
  }

  private handleExpandNodes(ids: string[]) {

    ids = this.skipExpandedNodeIDs(ids);

    if (ids && ids.length > 0) {
      return this.expandOnDataChange(ids);
    } else {
      return Promise.resolve();
    }

  }

  getStateClass(node: TreeNode) {
    return DocumentUtils.getStateClass(node.state, node.type);
  }

  jumpToNode(id: string, resetSelection = true): Promise<void> {

    if (resetSelection) {
      this.treeService.selectionModel.clear();
    }

    if (id !== null) {
      // TODO: do not always request path, when not needed
      return this.database.getPath(id).then((path) => {
        this.activeNodeId = path.pop();
        if (path.length > 0) {
          this.handleExpandNodes(path)
            .then(() => {
              const node = this.dataSource.getNode(id);
              if (node) {
                const nodePath = this.getTitlesFromNodePath(node);
                this.currentPath.next(nodePath);
                if (resetSelection) {
                  this.activate.next([id]);
                  this.treeService.selectionModel.select(node);
                }
                this.scrollToActiveElement();
              }
            });
        } else {
          if (resetSelection) {
            this.activate.next(id ? [id] : []);
          }
          if (id) {
            const node = this.dataSource.getNode(id);
            if (node) {
              const nodePath = this.getTitlesFromNodePath(node);
              this.currentPath.next(nodePath);
              if (resetSelection) {
                this.treeService.selectionModel.select(node);
              }
              this.scrollToActiveElement();
            }
          }
        }
      });
    } else {
      return Promise.resolve();
    }
  }

  private scrollToActiveElement() {
    // TODO: wait till dom node is actually there
    if (!this.treeContainerElement) {
      console.warn('treeContainerElement is not available');
      return;
    }

    const queryFn = () => this.treeContainerElement.nativeElement.querySelector('.mat-tree-node.active');

    this.waitFor(queryFn, () => {
      const element = queryFn();
      if (element) {
        // we need a timeout here to let node settle in tree so we can scroll to it
        setTimeout(() => element.scrollIntoView({behavior: 'smooth', block: 'center'}), 100);
      }
    });
  }

  private waitFor(elementFunction, callback, count = 3) {
    const queryResult = elementFunction();
    if (!queryResult && count !== 0) {
      console.log('Waiting for tree container element', count);
      setTimeout(() => this.waitFor(elementFunction, callback, --count), 500);
      return;
    }
    callback();
  }

  private skipExpandedNodeIDs(ids: string[]): string[] {

    if (!this.dataSource.data) {
      return ids;
    }

    let pos = null;
    ids.some((id, index) => {
      const treeNode = this.dataSource.data.find(item => item._id === id);
      const isExpanded = this.treeControl.isExpanded(treeNode);
      if (!isExpanded) {
        pos = index;
        return true;
      }
    });
    return pos === null ? [] : ids.slice(pos, ids.length);
  }

  ngOnDestroy(): void {
    this.currentPath.next([]);
  }

  private handleTreeExpandToInitialNode() {
    if (this.expandNodeIds) {
      // FIXME: this path might not be used anymore, since tree takes care of expanded nodes
      //        itself, when setting activeNodeId
      combineLatest([
        this.reloadTree(),
        this.expandNodeIds
      ])
        .pipe(untilDestroyed(this))
        .subscribe(result => {
          setTimeout(() => {
            const ids = result[1];
            this.handleExpandNodes(ids)
              .then(() => {
                const node = this.dataSource.getNode(this.activeNodeId);
                const nodePath = this.getTitlesFromNodePath(node);
                this.currentPath.next(nodePath);
                this.treeService.selectionModel.select(node);
              });
          });
        });
    } else {
      this.reloadTree().subscribe(() => this.handleActiveNodeSubscription());
    }
  }

  handleFolderClick(node: TreeNode, $event: MouseEvent) {
    if (this.disabledCondition(node)) {
      if (node.hasChildren) {
        this.treeControl.toggle(node);
      }
    } else {
      this.selectNode(node, $event);
    }
  }

  private async moveNodes(srcDocIds: string[], destination: string) {

    const treeNodes = srcDocIds
      .map(docId => this.dataSource.data.find(item => item._id === docId));
    treeNodes.forEach(node => this.handleNodeRemoval(node));

    // make sure new parent has correct children info
    if (destination) {
      const destinationNodeIndex = this.dataSource.data.findIndex(item => item._id === destination);
      if (destinationNodeIndex > -1) {
        this.dataSource.data[destinationNodeIndex].hasChildren = true;
      }
    }

    // jump to new location of moved node (since backend already moved node)
    const id = <string>srcDocIds[0];
    await this.jumpToNode(id, false);

    treeNodes.forEach(treeNode => this.dataSource.insertNodeInTree(treeNode, destination));

    // TODO: only set this if it's the currently loaded document
    this.activeNodeId = id;
    this.activate.next([id]);
    this.updateNodePath(id);
  }

  /**
   * See here for example: https://stackblitz.com/edit/angular-draggable-mat-tree
   * @param event
   * @param droppedNode
   */
  drop(event: DragEvent, droppedNode: TreeNode) {
    event.preventDefault();


    const dropInfo = this.dragManager.getDropInfo(droppedNode);

    if (dropInfo.allow) {
      this.dropped.next({
        srcIds: [dropInfo.srcNode._id],
        destination: droppedNode === null ? null : droppedNode._id
      });

      // move will be initiated by document service when node was moved in backend
      // this.moveNodes([dropInfo.srcNode._id], droppedNode._id);
    }

    this.dragManager.handleDragEnd();

  }

  handleDragStart($event: DragEvent, node: any) {

    // set flag delayed to correctly initiate dragging of a node
    setTimeout(() => this.isDragging = true);
    this.dragManager.handleDragStart($event, node);

  }

  handleDragEnd() {

    this.isDragging = false;
    this.dragManager.handleDragEnd();

  }

  /**
   * Tree Selection
   */

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  nodeSelectionToggle(node: TreeNode): void {
    this.treeService.selectionModel.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TreeNode): void {
    let parent: TreeNode | null = this.getParentNode(node).parent;
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent).parent;
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TreeNode): void {
    const nodeSelected = this.treeService.selectionModel.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.treeService.selectionModel.isSelected(child);
    });
    if (nodeSelected && !descAllSelected) {
      this.treeService.selectionModel.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.treeService.selectionModel.select(node);
    }
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TreeNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const selectedButHasNoChildren = !node.hasChildren && this.treeService.selectionModel.isSelected(node);
    const selectedButHasNotLoadedChildren = node.hasChildren
      && this.treeService.selectionModel.isSelected(node)
      && descendants.length === 0;

    return selectedButHasNoChildren
      || selectedButHasNotLoadedChildren
      || (descendants.length > 0 && descendants.every(child => {
        return this.treeService.selectionModel.isSelected(child);
      }));
  }

  isSelected(node: TreeNode): boolean {
    return this.treeService.selectionModel.isSelected(node);
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TreeNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.treeService.selectionModel.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  folderSelectionToggle(node: TreeNode): void {
    this.treeService.selectionModel.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.treeService.selectionModel.isSelected(node)
      ? this.treeService.selectionModel.select(...descendants)
      : this.treeService.selectionModel.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.treeService.selectionModel.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  toggleSelectionMode() {
    this.showMultiSelectionMode = !this.showMultiSelectionMode;
    if (!this.showMultiSelectionMode) {
      this.treeService.selectionModel.clear();
      if (this.activeNode) {
        this.treeService.selectionModel.select(this.activeNode);
      }
    }
  }
}
