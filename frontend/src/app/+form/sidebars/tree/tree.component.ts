/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
  input,
  output,
} from "@angular/core";
import { FlatTreeControl } from "@angular/cdk/tree";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map, tap } from "rxjs/operators";
import { UpdateDatasetInfo } from "../../../models/update-dataset-info.model";
import { UpdateType } from "../../../models/update-type.enum";
import { DynamicDataSource } from "./dynamic.datasource";
import { DynamicDatabase } from "./dynamic.database";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TreeService } from "./tree.service";
import { DragNDropUtils } from "./dragndrop.utils";
import { TreeSelection } from "./tree-selection";
import { ConfigService } from "../../../services/config/config.service";
import { HttpErrorResponse } from "@angular/common/http";
import { DocumentAbstract } from "../../../store/document/document.model";
import { DocBehavioursService } from "../../../services/event/doc-behaviours.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { TreeHeaderComponent } from "./tree-header/tree-header.component";
import { MatIcon } from "@angular/material/icon";
import {
  MatTree,
  MatTreeNode,
  MatTreeNodeDef,
  MatTreeNodePadding,
  MatTreeNodeToggle,
} from "@angular/material/tree";
import { CdkMonitorFocus } from "@angular/cdk/a11y";
import { MatIconButton } from "@angular/material/button";
import { MatCheckbox } from "@angular/material/checkbox";
import { DocumentIconComponent } from "../../../shared/document-icon/document-icon.component";
import { MatTooltip } from "@angular/material/tooltip";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { EmptyNavigationComponent } from "./empty-navigation/empty-navigation.component";

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
  imports: [
    TranslocoDirective,
    TreeHeaderComponent,
    MatIcon,
    MatTree,
    MatTreeNodeDef,
    MatTreeNode,
    MatTreeNodePadding,
    CdkMonitorFocus,
    MatIconButton,
    MatTreeNodeToggle,
    MatCheckbox,
    DocumentIconComponent,
    MatTooltip,
    MatProgressSpinner,
    EmptyNavigationComponent,
  ],
})
export class TreeComponent implements OnInit {
  readonly forAddresses = input<boolean>(undefined);
  readonly showHeader = input(true);
  readonly showMultiSelectButton = input(false);
  readonly showReloadButton = input(true);
  readonly setActiveNode = input<Subject<number>>(undefined);
  readonly update = input<Observable<any>>(undefined);
  readonly showHeaderOptions = input(true);
  readonly showWriteAccessToggle = input(false);
  readonly showOnlyFolders = input(false);
  readonly enableDrag = input(false);
  readonly hideReadOnly = input(false);
  readonly ignoreTreeUpdates = input(false);
  readonly searchSuggestions = input<Observable<DocumentAbstract[]>>(undefined);

  readonly selected = output<number[]>();
  readonly activate = output<string[]>();
  readonly dropped = output<any>();
  readonly multiEditMode = output<any>();
  readonly error = output<HttpErrorResponse>();

  @ViewChild("treeComponent", { read: ElementRef })
  treeContainerElement: ElementRef;

  /**
   * A function to determine if a tree node should be disabled.
   */
  readonly disabledCondition = input<(TreeNode) => boolean>(() => {
    return false;
  });

  /**
   * A function to determine if a tree node can be expanded.
   */
  readonly isExpandable = input((node: TreeNode) => node.hasChildren);

  readonly allowMultiSelectionMode = input(true);

  getLevel = (node: TreeNode) => node.level;

  treeControl: FlatTreeControl<TreeNode> = new FlatTreeControl<TreeNode>(
    this.getLevel,
    this.isExpandable(),
  );

  /** The node selection must be kept local */
  selection: TreeSelection = new TreeSelection(this.treeControl);

  // signal to show that a tree node is loading
  isLoading: TreeNode;
  activeNodeId: WritableSignal<number> = signal<number>(null);

  dataSource: DynamicDataSource;
  hasData: boolean;

  emptySearchResults: TreeNode[] = [];

  dragManager: DragNDropUtils;
  isDragging = false;
  hasWriteToRootPermission = this.configService.hasWriteRootPermission();
  initialized = false;

  constructor(
    private database: DynamicDatabase,
    public treeService: TreeService,
    public configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private docBehaviour: DocBehavioursService,
  ) {
    this.treeControl.dataNodes = [];
    effect(() => {
      this.multiEditMode.emit(this.selection.multiSelectionModeEnabled());
    });
    effect(() => {
      const doReload = this.treeService.isReloadNeededWithReset(
        this.forAddresses(),
      );
      if (doReload) {
        // delay reload to use correct activeId
        // when we jump from import page (after an import) the previously active node
        // could be opened instead of the imported document
        setTimeout(() => this.reloadTree(true).subscribe(), 300);
      }
    });
  }

  ngOnInit(): void {
    this.selection.allowMultiSelectionMode = this.allowMultiSelectionMode();
    this.selection.model.changed
      .pipe(
        untilDestroyed(this),
        map((data) => data.source.selected.map((item) => item._id)),
        tap((data) => this.selected.emit(data)),
      )
      .subscribe();

    const forAddresses = this.forAddresses();
    this.database.init(forAddresses);

    this.dataSource = new DynamicDataSource(
      this.treeControl,
      this.database,
      this.treeService,
    );
    this.dataSource.dataChange
      .pipe(
        untilDestroyed(this),
        map((data) => data?.length > 0),
        tap((notEmpty) => {
          this.hasData = notEmpty;
          this.cdr.markForCheck();
        }),
      )
      .subscribe();

    this.dragManager = new DragNDropUtils(
      this.treeControl,
      this.docBehaviour,
      forAddresses,
    );
    //previous code used to be in constructor

    this.database.hideReadOnly = this.hideReadOnly();
    this.dataSource.setForAddress(forAddresses);

    // make sure the tree with root nodes is loaded before we start
    // expanding the path if any
    this.handleTreeExpandToInitialNode();

    if (!this.ignoreTreeUpdates()) {
      this.database.treeUpdates
        .pipe(untilDestroyed(this))
        .subscribe((data) => this.handleUpdate(data));
    }

    this.searchSuggestions()
      ?.pipe(
        untilDestroyed(this),
        map((doc) => this.database.mapDocumentsToTreeNodes(doc, 0)),
      )
      .subscribe((nodes) => {
        this.emptySearchResults = nodes;
        this.cdr.detectChanges();
      });
  }

  private handleActiveNodeSubscription() {
    const setActiveNode = this.setActiveNode();
    if (!setActiveNode) {
      return;
    }

    setActiveNode
      .pipe(untilDestroyed(this), debounceTime(100), distinctUntilChanged())
      .subscribe(async (id) => {
        if (this.activeNodeId() === id) {
          return;
        }
        this.activeNodeId.set(id);
        // when setting a node from the outside, then do not emit activate event again
        this.jumpToNode(id, true, false).catch((e) => this.error.emit(e));
      });
  }

  private expandOnDataChange(ids: number[]): Promise<void> {
    return new Promise((resolve) => {
      const initialId = ids.shift();
      const expanderSubscription = this.dataSource.nodeExpanded$.subscribe(
        () => {
          const nextId = ids.shift();
          if (!nextId) {
            expanderSubscription.unsubscribe();
            resolve();
            return;
          }
          const nodeToExpand = this.dataSource.data.filter(
            (node) => node._id === nextId,
          )[0];
          this.treeControl.expand(nodeToExpand);
        },
      );

      const nodeToExpand = this.dataSource.data.filter(
        (node) => node._id === initialId,
      )[0];
      this.treeControl.expand(nodeToExpand);
    });
  }

  /**
   * Check if a tree node as children. This is used by the HTML-template when building the tree.
   * @param _
   * @param node is the current tree node
   */
  isFolder = (_: number, node: TreeNode) => {
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
    return this.database.initialData(forceFromServer, this.forAddresses()).pipe(
      map((docs) => this.database.mapDocumentsToTreeNodes(docs, 0)),
      map((docs) => docs.sort(this.treeService.getSortTreeNodesFunction())),
      tap((rootElements) => {
        this.dataSource.data = rootElements;
        this.selection.model.clear();
        if (this.activeNodeId) {
          this.jumpToNode(this.activeNodeId());
        }
        // after new data has arrived call change detection
        this.cdr.detectChanges();
      }),
    );
  }

  private handleUpdate(updateInfo: UpdateDatasetInfo) {
    // disable multi selection mode after a tree operation
    this.selection.multiSelectionModeEnabled.set(false);
    // if we have no data yet, ignore updates
    if (this.dataSource.data != null) {
      switch (updateInfo.type) {
        case UpdateType.New:
          return this.addNewNodes(updateInfo);
        case UpdateType.Update:
          return this.dataSource.updateNode(updateInfo.data);
        case UpdateType.Delete:
          this.deleteNode(updateInfo);
          return;
        case UpdateType.Move:
          const srcDocIds = updateInfo.data.map((doc) => <number>doc.id);
          this.moveNodes(srcDocIds, updateInfo.parent);
          return;
        default:
          throw new Error("Tree Action type not known: " + updateInfo.type);
      }
    }
  }

  private deleteNode(updateInfo: UpdateDatasetInfo) {
    const treeNodes = updateInfo["data"].map((doc) =>
      this.dataSource.data.find((item) => item._id === doc.id),
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
      this.activeNodeId.set(updateInfo.data[0].id as number);
    }

    if (updateInfo.parent) {
      const parentNodeIndex = this.dataSource.data.findIndex(
        (item) => item._id === updateInfo.parent,
      );

      if (parentNodeIndex === -1) {
        // parent node seems to be nested deeper: jump to node to open all parents
        console.debug(
          "Parent not found, expanding tree nodes: ",
          updateInfo.path,
        );
        await this.jumpToNode(updateInfo.data[0].id as number, false);
      } else {
        //parent node found only update store
        this.updateChildrenFromServer(
          updateInfo.parent,
          <number>updateInfo.data[0].id,
          updateInfo.doNotSelect,
        );
      }
    } else {
      // no parent node, add to root
      const newRootTreeNodes = this.database.mapDocumentsToTreeNodes(
        updateInfo.data,
        0,
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
    parentNodeId: number,
    id: number,
    doNotSelect: boolean,
  ) {
    if (parentNodeId === null) {
      this.reloadTree(true).subscribe();
      return;
    }

    const parentNodeIndex = this.dataSource.data.findIndex(
      (item) => item._id === parentNodeId,
    );
    const parentNode = this.dataSource.data[parentNodeIndex];
    parentNode.hasChildren = true;

    // node will be added automatically when expanded
    const isExpanded = this.treeControl.isExpanded(parentNode);
    this.database
      .getChildren(parentNodeId, true, this.forAddresses())
      .subscribe(() => {
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

  private handleExpandNodes(ids: number[]) {
    ids = this.skipExpandedNodeIDs(ids);

    if (ids && ids.length > 0) {
      return this.expandOnDataChange(ids);
    } else {
      return Promise.resolve();
    }
  }

  async jumpToNode(
    id: number,
    resetSelection = true,
    emitActive = true,
  ): Promise<void> {
    if (resetSelection) {
      this.selection.model.clear();
    }

    if (id === null || id === undefined) {
      this.activeNodeId.set(null);
      return Promise.resolve();
    }

    // TODO: do not always request path, when not needed
    const path = await this.database.getPath(id);
    // skip last node which does not need to be expanded
    path.pop();

    if (path.length > 0) {
      await this.handleExpandNodes(path);
    }
    this.selectAndScrollToNode(id, resetSelection, emitActive);
  }

  private selectAndScrollToNode(
    id: number,
    resetSelection: boolean,
    emitActive: boolean,
  ) {
    const node = this.dataSource.getNode(id);
    if (node) {
      if (resetSelection) {
        this.selectNode(node, null, emitActive);
      }
      // we need to scroll after the selection is done in DOM
      setTimeout(() => this.scrollToActiveElement());
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
        ".mat-tree-node.active",
      );

    this.waitFor(queryFn, () => {
      const element = queryFn();
      if (element) {
        // we need a timeout here to let node settle in tree so we can scroll to it
        setTimeout(
          () => element.scrollIntoView({ behavior: "smooth", block: "center" }),
          100,
        );
      }
    });
  }

  private waitFor(elementFunction, callback, count = 3) {
    const queryResult = elementFunction();
    if (!queryResult && count !== 0) {
      console.debug("Waiting for tree container element", count);
      setTimeout(() => this.waitFor(elementFunction, callback, --count), 500);
      return;
    }
    callback();
  }

  private skipExpandedNodeIDs(ids: number[]): number[] {
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
    this.reloadTree().subscribe(() => {
      this.handleActiveNodeSubscription();
      this.initialized = true;
      this.cdr.detectChanges();
    });
  }

  handleFolderClick(node: TreeNode, $event: MouseEvent) {
    // only toggle children if node is disabled
    if (this.disabledCondition()(node)) {
      if (this.isExpandable()(node)) {
        this.treeControl.toggle(node);
      }
    } else {
      this.selectNode(node, $event);
    }
  }

  private async moveNodes(srcDocIds: number[], destination: number) {
    const id = <number>srcDocIds[0];

    const treeNodes = srcDocIds.map((docId) =>
      this.dataSource.data.find((item) => item._id === docId),
    );

    treeNodes.forEach((node) => this.handleNodeRemoval(node));

    // make sure new parent has correct children info
    if (destination) {
      const destinationNodeIndex = this.dataSource.data.findIndex(
        (item) => item._id === destination,
      );
      if (destinationNodeIndex > -1) {
        this.dataSource.data[destinationNodeIndex].hasChildren = true;
      }
    }

    // jump to new location of moved node (since backend already moved node)
    await this.jumpToNode(id, false);

    treeNodes.forEach((treeNode) =>
      this.dataSource.insertNodeInTree(treeNode, destination),
    );
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
      this.dropped.emit({
        srcIds: this.selection.model.selected.some(
          (node) => node._id === this.dragManager.dragNode._id,
        )
          ? this.selection.model.selected.map((node) => node._id)
          : [this.dragManager.dragNode._id],
        destination: droppedNode === null ? null : droppedNode._id,
      });

      // move will be initiated by document service when node was moved in backend
      // this.moveNodes([dropInfo.srcNode._id], droppedNode._id);
    }

    this.handleDragEnd();
  }

  handleDragStart($event: DragEvent, node: any) {
    // set flag delayed to correctly initiate dragging of a node
    if (this.enableDrag()) $event.dataTransfer.effectAllowed = "move";
    setTimeout(() => (this.isDragging = true));
    this.dragManager.handleDragStart($event, node);
  }

  handleDragEnd() {
    this.isDragging = false;
    this.dragManager.handleDragEnd();
  }

  async handleSelection(id: number) {
    if (this.selection.multiSelectionModeEnabled()) {
      await this.jumpToNode(id, false);
      const node = this.dataSource.getNode(id);
      this.selectNode(node);
    } else {
      await this.jumpToNode(id);
    }
  }

  toggleWriteAccess(showDocsWithWriteAccess: boolean) {
    this.database.hideReadOnly = showDocsWithWriteAccess;
    this.reloadTree(true).subscribe();
  }

  toggleSelectionMode(isEditMode: boolean) {
    this.selection.toggleSelectionMode(isEditMode);
  }

  selectNode(node: TreeNode, $event?: MouseEvent, emitActive = true) {
    if (this.disabledCondition()(node)) {
      // disabled nodes can't be selected
      return;
    }
    const id = this.selection.selectNode(node, $event);

    if (!id) return;

    this.activeNodeId.set(id);
    if (emitActive) {
      this.activate.emit([node._uuid]);
    }
  }
}
