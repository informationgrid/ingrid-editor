import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {Observable} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {map} from 'rxjs/operators';
import {UpdateDatasetInfo} from '../../../models/update-dataset-info.model';
import {UpdateType} from '../../../models/update-type.enum';
import {DynamicDataSource} from './dynamic.datasource';
import {DynamicDatabase} from './dynamic.database';

export enum TreeActionType {
  ADD, UPDATE, DELETE
}

export class TreeAction {
  constructor(public type: TreeActionType, public id: string) {
  }
}

@Component({
  selector: 'ige-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  providers: [DynamicDatabase]
})
export class TreeComponent implements OnInit {

  @Input() expandNodeIds: Observable<string[]>;
  @Input() showReloadButton = true;
  @Input() activeNodeId: string = null;
  @Input() update: Observable<any>;

  /** The selection for checklist */
  selectionModel = new SelectionModel<TreeNode>(true);
  @Output() selected = this.selectionModel.changed.pipe(
    map(data => data.source.selected.map(item => item._id))
  );
  @Output() activate = new EventEmitter<string[]>();
  @Output() currentPath = new EventEmitter<string[]>();

  // signal to show that a tree node is loading
  private isLoading: TreeNode;

  treeControl: FlatTreeControl<TreeNode>;

  dataSource: DynamicDataSource;

  /**
   * A function to determine if a tree node should be disabled.
   */
  @Input() disabledCondition: (TreeNode) => boolean = () => {
    return false;
  };


  constructor(private database: DynamicDatabase) {
    this.treeControl = new FlatTreeControl<TreeNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);
  }

  getLevel = (node: TreeNode) => node.level;

  isExpandable = (node: TreeNode) => node.hasChildren;

  ngOnInit(): void {
    this.reloadTree();

    // after root nodes are loaded start expansion
    if (this.expandNodeIds) {
      this.expandNodeIds.subscribe(ids => {
        this.handleExpandNodes(ids)
          .then(() => {
            const node = this.dataSource.getNode(this.activeNodeId);
            const nodePath = this.getTitlesFromNodePath(node);
            this.currentPath.next(nodePath);
          }).catch( () => {});
      });
    }

    this.database.treeUpdates.subscribe(data => this.handleUpdate(data));

  }


  private expandOnDataChange(ids: string[]): Promise<void> {
    let resolveNextTime = false;
    return new Promise(resolve => {
      const changeObserver = this.dataSource.dataChange.subscribe(data => {
        console.log('data change', data);
        console.log('resolve now', resolveNextTime);
        if (resolveNextTime) {
          setTimeout(() => changeObserver.unsubscribe(), 0);
          resolve();
          return;
        }
        if (data === null) {
          return;
        }

        if (ids.length > 0) {
          const nextId = ids.shift();
          const nodeToExpand = data.filter(node => node._id === nextId)[0];
          this.treeControl.expand(nodeToExpand);
        }
        if (ids.length === 0) {
          console.log('stop subscriber');
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

  private getTitlesFromNodePath(node: TreeNode) {
    const path = [];
    let parent = node.parent;
    while (parent !== null && parent !== undefined) {
      const parentNode = this.dataSource.getNode(parent);
      parent = parentNode.parent;
      path.push(parentNode.title);
    }
    return path.reverse();
  }

  private getParentNode(node: TreeNode) {
    const nodeIndex = this.dataSource.data.findIndex(item => item._id === node._id);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (this.dataSource.data[i].level === node.level - 1) {
        return this.dataSource.data[i];
      }
    }

    return null;
  }

  reloadTree() {
    this.database.initialData(true)
      .pipe(
        map(docs => this.database.mapDocumentsToTreeNodes(docs, 0)),
        map(docs => docs.sort(this.dataSource.sortNodesByFolderFirst))
      )
      .subscribe(rootElements => this.dataSource.data = rootElements);
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
    const parentNodes = updateInfo['data']
      .map(doc => this.dataSource.data.find(item => item._id === doc.id))
      .map(node => this.getParentNode(node));

    this.dataSource.removeNode(updateInfo.data);

    // update parent nodes in case they do not have any children anymore
    parentNodes.forEach(parentNode => this.updateChildrenInfo(parentNode));
  }

  private addNewNode(updateInfo: UpdateDatasetInfo) {
    if (updateInfo.parent) {
      const parentNodeIndex = this.dataSource.data.findIndex(item => item._id === updateInfo.parent);
      const parentNode = this.dataSource.data[parentNodeIndex];
      parentNode.hasChildren = true;

      // node will be added automatically when expanded
      const isExpanded = this.treeControl.isExpanded(parentNode);

      if (isExpanded) {
        this.dataSource.addNode(updateInfo.parent, updateInfo.data);
      } else {
        this.treeControl.expand(parentNode);
      }
    } else {
      this.dataSource.addNode(updateInfo.parent, updateInfo.data);
    }

    this.activeNodeId = updateInfo.data[0].id + '';

    // remove selection from previously selected nodes
    this.selectionModel.clear();

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
    if (ids && ids.length > 0) {
      return this.expandOnDataChange(ids);
    } else {
      return Promise.reject();
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

  jumpToNode(id: string) {
    this.database.getPath(id).then((path) => {
      this.activeNodeId = path.pop();
      if (path.length > 0) {
        this.handleExpandNodes(path)
          .then(() => {
            const node = this.dataSource.getNode(id);
            const nodePath = this.getTitlesFromNodePath(node);
            this.currentPath.next(nodePath);
            this.activate.next([id]);
          });
      } else {
        this.activate.next([id]);
      }
    });
  }
}
