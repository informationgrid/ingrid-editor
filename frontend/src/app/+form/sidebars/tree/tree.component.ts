import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {combineLatest, Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {map, tap} from 'rxjs/operators';
import {UpdateDatasetInfo} from '../../../models/update-dataset-info.model';
import {UpdateType} from '../../../models/update-type.enum';
import {DynamicDataSource} from './dynamic.datasource';
import {DynamicDatabase} from './dynamic.database';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {TreeService} from './tree.service';

export enum TreeActionType {
  ADD, UPDATE, DELETE
}

export class TreeAction {
  constructor(public type: TreeActionType, public id: string) {
  }
}

export class ShortTreeNode {
  constructor(public id: string, public title: string) {
  }
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

  /** The selection for checklist */
  selectionModel = new SelectionModel<TreeNode>(true);
  @Output() selected = this.selectionModel.changed.pipe(
    map(data => data.source.selected.map(item => item._id))
  );
  @Output() activate = new EventEmitter<string[]>();
  @Output() currentPath = new EventEmitter<ShortTreeNode[]>();

  @ViewChild('treeComponent', {read: ElementRef}) treeContainerElement: ElementRef;

  // signal to show that a tree node is loading
  private isLoading: TreeNode;
  activeNodeId: string = null;

  treeControl: FlatTreeControl<TreeNode>;

  dataSource: DynamicDataSource;

  /**
   * A function to determine if a tree node should be disabled.
   */
  @Input() disabledCondition: (TreeNode) => boolean = () => {
    return false;
  };


  constructor(private database: DynamicDatabase, private treeService: TreeService) {
    this.treeControl = new FlatTreeControl<TreeNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database, treeService);
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
    if (this.setActiveNode) {
      this.setActiveNode
        .pipe(untilDestroyed(this))
        .subscribe(id => {
          this.jumpToNode(id).then(() => this.activeNodeId = id);
        });
    }
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
    if ($event.ctrlKey) {
      this.selectionModel.toggle(node);
    } else {
      this.selectionModel.clear();
      this.selectionModel.select(node);
      this.activeNodeId = this.selectionModel.selected[0]._id;
      this.activate.next([this.activeNodeId]);

      // set path in tree for bread crumb (extract to method)
      const path = this.getTitlesFromNodePath(node);
      this.currentPath.next(path);
    }

    if (node.hasChildren) {
      this.treeControl.toggle(node);
    }

  }

  private getTitlesFromNodePath(node: TreeNode): ShortTreeNode[] {
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
          this.selectionModel.clear();
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
      case UpdateType.Copy:
        // no marking of nodes
        return;
      case UpdateType.Paste:
        console.warn('Paste not implemented yet');
        return;
      default:
        throw new Error('Tree Action type not known: ' + updateInfo.type);
    }
  }

  private deleteNode(updateInfo: UpdateDatasetInfo) {
    const parentNodeRelations = updateInfo['data']
      .map(doc => this.dataSource.data.find(item => item._id === doc.id))
      .map(node => this.getParentNode(node));

    // update parent nodes in case they do not have any children anymore
    parentNodeRelations.forEach(parentNode => {
      // first collapse nodes to be deleted to make sure all sub nodes are removed
      this.treeControl.collapse(parentNode.node);
      this.dataSource.removeNode(parentNode.node);
      this.updateChildrenInfo(parentNode.parent)
    });

  }

  private async addNewNode(updateInfo: UpdateDatasetInfo) {
    console.log('addnewNode');

    this.activeNodeId = updateInfo.data[0].id + '';

    if (updateInfo.parent) {

      const parentNodeIndex = this.dataSource.data.findIndex(item => item._id === updateInfo.parent);

      // parent node seems to be nested deeper
      if (parentNodeIndex === -1) {
        console.log('Parent not found, using path: ', updateInfo.path);
        if (this.expandNodeIds) {
          this.expandNodeIds.next(updateInfo.path);
        }
        return;
      }

      // TODO: use function jumpToNode

      const parentNode = this.dataSource.data[parentNodeIndex];
      parentNode.hasChildren = true;

      // node will be added automatically when expanded
      const isExpanded = this.treeControl.isExpanded(parentNode);

      this.database.getChildren(parentNode._id, true, this.forAddresses)
        .subscribe(() => {
          if (isExpanded) {
            this.treeControl.collapse(parentNode);
          }
          this.treeControl.expand(parentNode);
          this.updateNodePath(updateInfo);
          this.scrollToActiveElement();
        });

    } else {
      this.dataSource.addRootNode(updateInfo.data[0]);
      this.updateNodePath(updateInfo);
      this.scrollToActiveElement();
    }

    // remove selection from previously selected nodes
    this.selectionModel.clear();

  }

  private updateNodePath(updateInfo: UpdateDatasetInfo) {
    const nodePath = this.getTitlesFromNodePath(this.dataSource.getNode(updateInfo.data[0].id + ''));
    this.currentPath.next(nodePath);
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
    switch (node.state) {
      case 'W':
        return 'working';
      case 'PW':
        return 'workingWithPublished';
      case 'P':
        return 'published';
      default:
        console.error('State is not supported: ' + node.state, node);
        throw new Error('State is not supported: ' + node.state);
    }
  }

  jumpToNode(id: string): Promise<void> {

    this.selectionModel.clear();

    if (id !== null) {
      return this.database.getPath(id, this.forAddresses).then((path) => {
        this.activeNodeId = path.pop();
        if (path.length > 0) {
          this.handleExpandNodes(path)
            .then(() => {
              const node = this.dataSource.getNode(id);
              const nodePath = this.getTitlesFromNodePath(node);
              this.currentPath.next(nodePath);
              this.activate.next([id]);
              this.selectionModel.select(node);
              this.scrollToActiveElement();
            });
        } else {
          this.activate.next(id ? [id] : []);
          if (id) {
            const node = this.dataSource.getNode(id);
            const nodePath = this.getTitlesFromNodePath(node);
            this.currentPath.next(nodePath);
            this.selectionModel.select(node);
            this.scrollToActiveElement();
          }
        }
      });
    } else {
      return Promise.resolve();
    }
  }

  private scrollToActiveElement() {
    // TODO: wait till dom node is actually there
    setTimeout(() => {
      const element = this.treeContainerElement.nativeElement
        .querySelector('.mat-tree-node.active');
      if (element) {
        element.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }, 500);
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
                this.selectionModel.select(node);
              });
          });
        });
    } else {
      this.reloadTree().subscribe(() => this.handleActiveNodeSubscription());
    }
  }
}
