import {Component, EventEmitter, Injectable, Input, OnInit, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {BehaviorSubject, merge, Observable, of, Subject} from 'rxjs';
import {CollectionViewer, SelectionChange} from '@angular/cdk/collections';
import {map} from 'rxjs/operators';
import {DocumentService} from '../../../services/document/document.service';
import {DocumentAbstract} from '../../../store/document/document.model';
import {TreeQuery} from '../../../store/tree/tree.query';
import {UpdateDatasetInfo} from '../../../models/update-dataset-info.model';
import {UpdateType} from '../../../models/update-type.enum';

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable()
export class DynamicDatabase {

  treeUpdates = new Subject<UpdateDatasetInfo>();

  constructor(private docService: DocumentService, private treeQuery: TreeQuery) {
    this.docService.datasetsChanged.subscribe(docs => this.treeUpdates.next(docs));
  }

  /** Initial data from database */
  initialData(forceFromServer?: boolean): Observable<DocumentAbstract[]> {
    return this.getChildren(null, forceFromServer);
  }

  getChildren(node: string, forceFromServer?: boolean): Observable<DocumentAbstract[]> {
    let children = forceFromServer ? [] : this.treeQuery.getChildren(node);

    if (children.length > 0) {
      return of(children);
    }
    return this.docService.getChildren(node);
  }

  isExpandable(node: string): boolean {
    return true; // this.dataMap.has(node);
  }
}

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
    if (expand) {
      this._database.getChildren(node._id)
        .pipe(
          map(docs => this.mapDocumentsToTreeNodes(docs, node.level + 1))
        ).subscribe(children => {
        if (!children || index < 0) { // If no children, or cannot find the node, no op
          return;
        }

        node.isLoading = true;

        // const nodes = children.map(child =>
        //   new TreeNode(name, node.profile, node.level + 1, this._database.isExpandable(name)));
        this.data.splice(index + 1, 0, ...children);
        // notify the change
        this.dataChange.next(this.data);
        node.isLoading = false;
      });
    } else {
      let count = 0;
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {
      }
      this.data.splice(index + 1, count);
      this.dataChange.next(this.data);
    }
  }

  mapDocumentsToTreeNodes(docs: DocumentAbstract[], level: number) {
    return docs.map(doc => new TreeNode(doc.id.toString(), doc.title, doc._profile, doc._state, level, true));
  }

  removeNode(docs: DocumentAbstract[]) {
    docs.forEach(doc => {
      let index = this.data.findIndex(node => node._id === doc.id);
      if (index !== -1) {
        this.data.splice(index, 1);
        this.dataChange.next(this.data);
      }
    });
  }

  updateNode(docs: DocumentAbstract[]) {
    docs.forEach(doc => {
      let index = this.data.findIndex(node => node._id === doc.id);
      if (index !== -1) {
        this.data.splice(index, 1, ...this.mapDocumentsToTreeNodes([doc], this.data[index].level));
        this.dataChange.next(this.data);
      }
    });
  }

  addNode(parent: string, docs: DocumentAbstract[]) {
    let index = this.data.findIndex(node => node._id === parent);
    let childLevel = 0;
    if (parent) {
      childLevel = this.data[index].level + 1;
    }
    this.data.splice(index + 1, 0, ...this.mapDocumentsToTreeNodes(docs, childLevel));
    this.dataChange.next(this.data);
  }
}


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
  @Input() selectedIds: Observable<string[]>;
  @Input() showReloadButton = false;
  @Input() initialActiveNodeId: string = null;
  @Input() update: Observable<any>;

  /**
   * A function to determine if a tree node should be disabled.
   */
  @Input() disabledCondition: (TreeNode) => boolean = () => {
    return false;
  };

  @Output() selected = new EventEmitter<string[]>();
  @Output() activate = new EventEmitter<string[]>();
  // @Output() reload = new EventEmitter<null>();

  // signal to show that a tree node is loading
  private isLoading: TreeNode;

  // store all nodes where we can find the nested items
  private copy: TreeNode[] = [];

  constructor(private database: DynamicDatabase) {
    this.treeControl = new FlatTreeControl<TreeNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);

    this.reloadTree();

  }

  treeControl: FlatTreeControl<TreeNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: TreeNode) => node.level;

  isExpandable = (node: TreeNode) => node.hasChildren;

  ngOnInit(): void {
    this.database.treeUpdates.subscribe(data => this.handleUpdate(data));

    if (this.expandNodeIds) {
      this.expandNodeIds.subscribe(ids => this.expandOnDataChange(ids));
    }
    if (this.update) {
      this.update.subscribe(data => this.handleUpdate(data));
    }
  }


  private expandOnDataChange(ids: string[]) {
    if (ids.length > 0) {
      const changeObserver = this.dataSource.dataChange.subscribe(data => {
        if (ids.length > 0) {
          const nextId = ids.shift();
          const nodeToExpand = data.filter(node => node._id === nextId)[0];
          this.treeControl.expand(nodeToExpand);
        } else {
          changeObserver.unsubscribe();
        }
      });
    }
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
    let selectedIds = [];
    if ($event.ctrlKey) {
      selectedIds = this.copy
        .filter(n => n.isSelected)
        .map(n => n._id);
    }

    // set selection state to new node
    // toggle state if ctrl-key is pressed, otherwise selected
    if ($event.ctrlKey && node.isSelected) {
      // deselect
      selectedIds.splice(selectedIds.indexOf(node._id), 1);
    } else {
      selectedIds.push(node._id);

      if (selectedIds.length === 1) {
        this.initialActiveNodeId = node._id;
        this.activate.next([node._id]);
      }

      if (node.hasChildren) {
        this.treeControl.toggle(node);
        // this.toggleNode(node);
      }

    }

    this.selected.next(selectedIds);

  }

  private getParentNode(node: TreeNode) {
    const nodeIndex = this.copy.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (this.copy[i].level === node.level - 1) {
        return this.copy[i];
      }
    }

    return null;
  }

  shouldRender(node: TreeNode) {
    const parent = this.getParentNode(node);
    return !parent || parent.isExpanded;
  }

  reloadTree() {
    // this.reload.next();
    this.database.initialData(true)
      .pipe(
        map(docs => this.dataSource.mapDocumentsToTreeNodes(docs, 0))
      )
      .subscribe(rootElements => this.dataSource.data = rootElements);
  }

  /**
   * Improve rendering speed so that we only render modified nodes.
   * @param index
   * @param item
   */
  trackByNodeId(index, item: TreeNode) {
    return item._id;
  }

  private handleUpdate(updateInfo: UpdateDatasetInfo) {
      switch (updateInfo.type) {
        case UpdateType.New:
          return this.dataSource.addNode(updateInfo.parent, updateInfo.data);
        case UpdateType.Update:
          return this.dataSource.updateNode(updateInfo.data);
        case UpdateType.Delete:
          return this.dataSource.removeNode(updateInfo.data);
        default:
          throw new Error('Tree Action type not known: ' + updateInfo.type);
      }
  }
}
