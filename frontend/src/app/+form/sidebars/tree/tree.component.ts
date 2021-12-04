import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FlatTreeControl } from "@angular/cdk/tree";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { combineLatest, Observable, Subject } from "rxjs";
import { map, tap } from "rxjs/operators";
import { UpdateDatasetInfo } from "../../../models/update-dataset-info.model";
import { UpdateType } from "../../../models/update-type.enum";
import { DynamicDataSource } from "./dynamic.datasource";
import { DynamicDatabase } from "./dynamic.database";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TreeService } from "./tree.service";
import { DocumentUtils } from "../../../services/document.utils";
import { DragNDropUtils } from "./dragndrop.utils";
import { TreeSelection } from "./tree-selection";
import { ConfigService } from "../../../services/config/config.service";

export enum TreeActionType {
  ADD,
  UPDATE,
  DELETE,
}

@UntilDestroy()
@Component({
  selector: "ige-tree",
  templateUrl: "./tree.component.html",
  styleUrls: ["./tree.component.scss"],
  providers: [DynamicDatabase],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent implements OnInit {
  @Input() forAddresses: boolean;
  @Input() expandNodeIds: Subject<string[]>;
  @Input() showHeader = true;
  @Input() showMultiSelectButton = false;
  @Input() showReloadButton = true;
  @Input() setActiveNode: Subject<string>;
  @Input() update: Observable<any>;
  @Input() showHeaderOptions = true;
  @Input() showOnlyFolders = false;
  @Input() enableDrag = false;
  @Input() hideReadOnly = false;

  @Output() selected = new EventEmitter<string[]>();
  @Output() activate = new EventEmitter<string[]>();
  @Output() dropped = new EventEmitter<any>();
  @Output() multiEditMode = new EventEmitter<any>();

  @ViewChild("treeComponent", { read: ElementRef })
  treeContainerElement: ElementRef;

  /**
   * A function to determine if a tree node should be disabled.
   */
  @Input() disabledCondition: (TreeNode) => boolean = () => {
    return false;
  };

  /**
   * A function to determine if a tree node can be expanded.
   */
  @Input() isExpandable = (node: TreeNode) => node.hasChildren;

  @Input() allowMultiSelectionMode = true;

  getLevel = (node: TreeNode) => node.level;

  treeControl: FlatTreeControl<TreeNode> = new FlatTreeControl<TreeNode>(
    this.getLevel,
    this.isExpandable
  );

  /** The node selection must be kept local */
  selection: TreeSelection = new TreeSelection(this.treeControl);

  // signal to show that a tree node is loading
  isLoading: TreeNode;
  activeNodeId: string = null;

  dataSource: DynamicDataSource;
  hasData: boolean;

  dragManager: DragNDropUtils;
  isDragging = false;
  isAdmin = this.configService.isAdmin();

  constructor(
    private database: DynamicDatabase,
    public treeService: TreeService,
    public configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {
    this.treeControl.dataNodes = [];
  }

  ngOnInit(): void {
    this.selection.allowMultiSelectionMode = this.allowMultiSelectionMode;
    this.selection.model.changed
      .pipe(
        untilDestroyed(this),
        map((data) => data.source.selected.map((item) => item._id)),
        tap((data) => this.selected.emit(data))
      )
      .subscribe();

    this.dataSource = new DynamicDataSource(
      this.treeControl,
      this.database,
      this.treeService
    );
    this.dataSource.dataChange
      .pipe(
        untilDestroyed(this),
        map((data) => data?.length > 0),
        tap((notEmpty) => (this.hasData = notEmpty))
      )
      .subscribe();

    this.dragManager = new DragNDropUtils(this.treeControl);
    //previous code used to be in constructor

    this.database.hideReadOnly = this.hideReadOnly;
    this.dataSource.setForAddress(this.forAddresses);

    // make sure the tree with root nodes is loaded before we start
    // expanding the path if any
    this.handleTreeExpandToInitialNode();

    this.database.treeUpdates
      .pipe(untilDestroyed(this))
      .subscribe((data) => this.handleUpdate(data));
  }

  private handleActiveNodeSubscription() {
    if (!this.setActiveNode) {
      return;
    }

    this.setActiveNode.pipe(untilDestroyed(this)).subscribe((id) => {
      if (this.activeNodeId === id) {
        return;
      }
      this.jumpToNode(id);
    });
  }

  private expandOnDataChange(ids: string[]): Promise<void> {
    let resolveNextTime = false;
    let nextId = null;

    // FIXME: if a root node is opened and we want to create a folder and in the dialog we
    //        search for a sub folder of the opened folder, then root nodes will always be
    //        triggered by dataChange, which mixes up resolveNextTime timing

    return new Promise((resolve) => {
      const changeObserver = this.dataSource.dataChange.subscribe((data) => {
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
          const nodeToExpand = data.filter((node) => node._id === nextId)[0];
          this.treeControl.expand(nodeToExpand);
        }
        if (ids.length === 0) {
          const folderAlreadyExpanded =
            data.find((d) => d.parent === nextId) !== undefined;
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
    return node.type === "FOLDER";
  };

  private getParentNode(node: TreeNode): { node: TreeNode; parent: TreeNode } {
    const nodeIndex = this.dataSource.data.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (this.dataSource.data[i].level === node.level - 1) {
        return { node: node, parent: this.dataSource.data[i] };
      }
    }

    return { node: node, parent: null };
  }

  reloadTree(forceFromServer = false): Observable<TreeNode[]> {
    return this.database.initialData(forceFromServer, this.forAddresses).pipe(
      map((docs) => this.database.mapDocumentsToTreeNodes(docs, 0)),
      map((docs) => docs.sort(this.treeService.getSortTreeNodesFunction())),
      tap((rootElements) => {
        this.dataSource.data = rootElements;
        this.selection.model.clear();
        if (this.activeNodeId) {
          this.jumpToNode(this.activeNodeId);
        }
        // after new data has arrived call change detection
        this.cdr.detectChanges();
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
        return this.addNewNodes(updateInfo);
      case UpdateType.Update:
        return this.dataSource.updateNode(updateInfo.data);
      case UpdateType.Delete:
        this.deleteNode(updateInfo);
        return;
      case UpdateType.Move:
        const srcDocIds = updateInfo.data.map((doc) => <string>doc.id);
        this.moveNodes(srcDocIds, updateInfo.parent);
        return;
      default:
        throw new Error("Tree Action type not known: " + updateInfo.type);
    }
  }

  private deleteNode(updateInfo: UpdateDatasetInfo) {
    const treeNodes = updateInfo["data"].map((doc) =>
      this.dataSource.data.find((item) => item._id === doc.id)
    );

    // update parent nodes in case they do not have any children anymore
    treeNodes.forEach((node) => this.handleNodeRemoval(node));
  }

  private handleNodeRemoval(node: TreeNode) {
    // first deselect node from selection model
    this.selection.model.deselect(node);

    const nodeInfo = this.getParentNode(node);
    // first collapse nodes to be deleted to make sure all sub nodes are removed
    this.treeControl.collapse(nodeInfo.node);
    this.dataSource.removeNode(nodeInfo.node);
    this.updateChildrenInfo(nodeInfo.parent);
  }

  private async addNewNodes(updateInfo: UpdateDatasetInfo) {
    if (!updateInfo.doNotSelect) {
      this.activeNodeId = updateInfo.data[0].id + "";
    }

    if (updateInfo.parent) {
      const parentNodeIndex = this.dataSource.data.findIndex(
        (item) => item._id === updateInfo.parent
      );

      // parent node seems to be nested deeper
      if (parentNodeIndex === -1) {
        console.log(
          "Parent not found, expanding tree nodes: ",
          updateInfo.path
        );
        if (this.expandNodeIds) {
          this.expandNodeIds.next(updateInfo.path);
        }
        return;
      }

      // TODO: use function jumpToNode
      this.updateChildrenFromServer(
        updateInfo.parent,
        <string>updateInfo.data[0].id,
        updateInfo.doNotSelect
      );
    } else {
      const newRootTreeNodes = this.database.mapDocumentsToTreeNodes(
        updateInfo.data,
        0
      );

      newRootTreeNodes.forEach((treeNode) => {
        this.dataSource.insertNodeInTree(treeNode, null);
      });
      this.scrollToActiveElement();
    }

    // remove selection from previously selected nodes
    if (!updateInfo.doNotSelect) {
      this.selection.model.clear();
    }
  }

  private updateChildrenFromServer(
    parentNodeId: string,
    id: string,
    doNotSelect: boolean
  ) {
    if (parentNodeId === null) {
      this.reloadTree(true).subscribe();
      return;
    }

    const parentNodeIndex = this.dataSource.data.findIndex(
      (item) => item._id === parentNodeId
    );
    const parentNode = this.dataSource.data[parentNodeIndex];
    parentNode.hasChildren = true;

    // node will be added automatically when expanded
    const isExpanded = this.treeControl.isExpanded(parentNode);

    this.database
      .getChildren(parentNodeId, true, this.forAddresses)
      .subscribe((children) => {
        console.log("updated children", children);
        if (isExpanded) {
          this.treeControl.collapse(parentNode);
        }
        this.treeControl.expand(parentNode);
        if (!doNotSelect) {
          this.scrollToActiveElement();
          let node = this.dataSource.getNode(id);
          this.selectNode(node);
        }
      });
  }

  private updateChildrenInfo(parentNode: TreeNode) {
    if (parentNode) {
      const index = this.dataSource.data.indexOf(parentNode);
      let count = 0;
      for (
        let i = index + 1;
        i < this.dataSource.data.length &&
        this.dataSource.data[i].level > parentNode.level;
        i++, count++
      ) {}
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
      this.selection.model.clear();
    }

    if (id !== null && id !== undefined) {
      // TODO: do not always request path, when not needed
      return this.database.getPath(id).then((path) => {
        // skip last node which does not need to be expanded
        path.pop();

        if (path.length > 0) {
          return this.handleExpandNodes(path).then(() => {
            const node = this.dataSource.getNode(id);
            if (node) {
              if (resetSelection) {
                this.selectNode(node);
              }
              this.scrollToActiveElement();
            }
          });
        } else {
          if (resetSelection) {
            this.activate.next(id ? [id] : []);
          }
          // TODO: id can never be null here!
          if (id) {
            const node = this.dataSource.getNode(id);
            if (node) {
              if (resetSelection) {
                this.selectNode(node);
              }
              this.scrollToActiveElement();
            }
          } else {
            console.error("ID cannot be null!?", id);
          }
        }
      });
    } else {
      this.activeNodeId = null;
      return Promise.resolve();
    }
  }

  private scrollToActiveElement() {
    // TODO: wait till dom node is actually there
    if (!this.treeContainerElement) {
      console.warn("treeContainerElement is not available");
      return;
    }

    const queryFn = () =>
      this.treeContainerElement.nativeElement.querySelector(
        ".mat-tree-node.active"
      );

    this.waitFor(queryFn, () => {
      const element = queryFn();
      if (element) {
        // we need a timeout here to let node settle in tree so we can scroll to it
        setTimeout(
          () => element.scrollIntoView({ behavior: "smooth", block: "center" }),
          100
        );
      }
    });
  }

  private waitFor(elementFunction, callback, count = 3) {
    const queryResult = elementFunction();
    if (!queryResult && count !== 0) {
      console.log("Waiting for tree container element", count);
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
      const treeNode = this.dataSource.data.find((item) => item._id === id);
      // if a tree node is undefined then is should be one where we don't have access to
      // but only to its children
      // handle node as expanded in this case
      if (treeNode === undefined) return false;

      const isExpanded = this.treeControl.isExpanded(treeNode);
      if (!isExpanded) {
        pos = index;
        return true;
      }
    });
    return pos === null ? [] : ids.slice(pos, ids.length);
  }

  private handleTreeExpandToInitialNode() {
    if (this.expandNodeIds) {
      // FIXME: this path might not be used anymore, since tree takes care of expanded nodes
      //        itself, when setting activeNodeId
      combineLatest([this.reloadTree(), this.expandNodeIds])
        .pipe(untilDestroyed(this))
        .subscribe((result) => {
          setTimeout(() => {
            const ids = result[1];
            this.handleExpandNodes(ids).then(() => {
              const node = this.dataSource.getNode(this.activeNodeId);
              this.selectNode(node);
            });
          });
        });
    } else {
      this.reloadTree().subscribe(() => this.handleActiveNodeSubscription());
    }
  }

  handleFolderClick(node: TreeNode, $event: MouseEvent) {
    // only toggle children if node is disabled
    if (this.disabledCondition(node)) {
      if (this.isExpandable(node)) {
        this.treeControl.toggle(node);
      }
    } else {
      this.selectNode(node, $event);
    }
  }

  private async moveNodes(srcDocIds: string[], destination: string) {
    const treeNodes = srcDocIds.map((docId) =>
      this.dataSource.data.find((item) => item._id === docId)
    );
    treeNodes.forEach((node) => this.handleNodeRemoval(node));

    // make sure new parent has correct children info
    if (destination) {
      const destinationNodeIndex = this.dataSource.data.findIndex(
        (item) => item._id === destination
      );
      if (destinationNodeIndex > -1) {
        this.dataSource.data[destinationNodeIndex].hasChildren = true;
      }
    }

    // jump to new location of moved node (since backend already moved node)
    const id = <string>srcDocIds[0];
    await this.jumpToNode(id, false);

    treeNodes.forEach((treeNode) =>
      this.dataSource.insertNodeInTree(treeNode, destination)
    );

    // TODO: only set this if it's the currently loaded document
    this.activeNodeId = id;
    this.activate.next([id]);
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
      // if dragNode is part of selection all selected ids are srcIds, else only dragNode is sourceId
      this.dropped.next({
        srcIds: this.selection.model.selected.some(
          (node) => node._id === this.dragManager.dragNode._id
        )
          ? this.selection.model.selected.map((node) => node._id)
          : [this.dragManager.dragNode._id],
        destination: droppedNode === null ? null : droppedNode._id,
      });

      // move will be initiated by document service when node was moved in backend
      // this.moveNodes([dropInfo.srcNode._id], droppedNode._id);
    }

    this.dragManager.handleDragEnd();
  }

  handleDragStart($event: DragEvent, node: any) {
    // set flag delayed to correctly initiate dragging of a node
    if (this.enableDrag) $event.dataTransfer.effectAllowed = "move";
    setTimeout(() => (this.isDragging = true));
    this.dragManager.handleDragStart($event, node);
  }

  handleDragEnd() {
    this.isDragging = false;
    this.dragManager.handleDragEnd();
  }

  async handleSelection(id: string) {
    if (this.selection.multiSelectionModeEnabled) {
      await this.jumpToNode(id, false);
      const node = this.dataSource.getNode(id);
      this.selectNode(node);
    } else {
      await this.jumpToNode(id);
    }
  }

  toggleView(showAll: boolean) {
    this.database.hideReadOnly = !showAll;
    this.reloadTree(true).subscribe();
  }

  toggleSelectionMode(isEditMode: boolean) {
    this.selection.toggleSelectionMode(isEditMode);

    // notify external components
    this.multiEditMode.next(this.selection.multiSelectionModeEnabled);
  }

  selectNode(node: TreeNode, $event?: MouseEvent) {
    const id = this.selection.selectNode(node, $event);

    if (id) {
      this.activeNodeId = id;
      this.activate.next([node._uuid]);
    }
  }
}
