import { Component, EventEmitter, Injectable, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularService } from '../../../services/formular/formular.service';
import { ErrorService } from '../../../services/error.service';
import { FormToolbarService } from '../../toolbar/form-toolbar.service';
import { SelectedDocument } from '../selected-document.model';
import { TreeNode } from 'primeng/api';
import { DocMainInfo } from '../../../models/update-dataset-info.model';
import { ProfileService } from '../../../services/profile.service';
import { merge, Subscription } from 'rxjs/index';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { map } from 'rxjs/internal/operators';

/** Flat node with expandable and level information */
export class DynamicFlatNode {
  constructor(
    public id: string,
    public label: string,
    public profile: string,
    public state: string,
    public level: number = 1,
    public expandable: boolean = false,
    public isLoading: boolean = false) {
  }
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable()
export class DynamicDatabase {
  dataMap = null;

  rootLevelNodes = null;

  constructor(private storageService: StorageService, private profileService: ProfileService,
              private formularService: FormularService) {
  }

  /** Initial data from database */
  initialData(): Promise<DynamicFlatNode[]> {
    return this.profileService.initialized.then( () => {

      return this.query( null ).then( (data) => {
        return data.map( item => new DynamicFlatNode( item._id, item.title, item._profile, item._state, 0, item._hasChildren ) );
      } );
    } );
  }

  query(id: string): Promise<any> {
    return new Promise( (resolve, reject) => {
      this.storageService.getChildDocuments( id ).subscribe( response => {
        console.log( 'got children', response );
        const nodes = this.prepareNodes(response, null);
        resolve( nodes );
      } );
      // }, (err) => this.errorService.handle( err ) );
    } );
  }

  prepareNodes(docs: any[], parentNode: any): any[] {
    if (parentNode && !parentNode.children) {
      parentNode.leaf = false;
      parentNode.children = [];
    }

    // const updatedNodes: any = parentNode ? parentNode : this.nodes;

    const modDocs = docs
      .filter( doc => doc._profile !== undefined )
      .sort( (doc1, doc2) => { // TODO: sort after conversion, then we don't need to call getTitle function
        return this.formularService.getTitle( doc1._profile, doc1 ).localeCompare( this.formularService.getTitle( doc2._profile, doc2 ) );
      } );
    modDocs.forEach( doc => {
        doc.title = this.formularService.getTitle( doc._profile, doc )
    //   const newNode = this.prepareNode( doc );
    //   if (parentNode) {
    //     updatedNodes.children.push( newNode );
    //   } else {
    //     updatedNodes.push( newNode );
    //   }
    //   this.flatNodes.push( newNode );
      } );
    return modDocs;
    // this.tree.treeModel.update();
  }


  getChildren(nodeId: string): Promise<any[]> | undefined {
    return this.query( nodeId );
  }

  isExpandable(node: any): boolean {
    return node._hasChildren;
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

  dataChange: BehaviorSubject<DynamicFlatNode[]> = new BehaviorSubject<DynamicFlatNode[]>( [] );

  cachedChildren: any = {};

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }

  set data(value: DynamicFlatNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next( value );
  }

  constructor(private treeControl: FlatTreeControl<DynamicFlatNode>,
              private database: DynamicDatabase) {
  }

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this.treeControl.expansionModel.onChange!.subscribe( change => {
      if ((change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed) {
        this.handleTreeControl( change as SelectionChange<DynamicFlatNode> );
      }
    } );

    return merge( collectionViewer.viewChange, this.dataChange ).pipe( map( () => this.data ) );
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach( (node) => this.toggleNode( node, true ) );
    }
    if (change.removed) {
      change.removed.reverse().forEach( (node) => this.toggleNode( node, false ) );
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: DynamicFlatNode, expand: boolean): Promise<any> {

    return new Promise(resolve => {

      if (expand) {

        // if node was loaded before, just add it to the data array
        if (this.cachedChildren[node.id]) {
          this.data.splice( this.data.indexOf( node ) + 1, 0, ...this.cachedChildren[node.id] );
          this.dataChange.next( this.data );
          resolve();

        } else { // if node wasn't loaded yet
          node.isLoading = true;

          this.database.getChildren( node.id ).then( children => {
            const index = this.data.indexOf( node );
            if (!children || index < 0) { // If no children, or cannot find the node, no op
              return;
            }

            const nodes = children.map( child => {
              return new DynamicFlatNode( child._id, child.title, child._profile, child._state, node.level + 1,
                this.database.isExpandable( child ) );
            } );
            this.data.splice( index + 1, 0, ...nodes );
            node.isLoading = false;
            this.cachedChildren[node.id] = nodes;
            this.dataChange.next( this.data );
            resolve();
          } );
        }

      } else { // collapse

        this.data.splice( this.data.indexOf( node ) + 1, this.cachedChildren[node.id].length );
        this.dataChange.next( this.data );
        resolve();
      }

    });
  }
}


@Component( {
  selector: 'ige-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
  providers: [DynamicDatabase]
} )
export class MetadataTreeComponent implements OnInit, OnDestroy {

  nodes: TreeNode[] = [];
  flatNodes: TreeNode[] = [];

  selectedNodes: TreeNode[];


@Input()
  showFolderEditButton = true;
@Output()
  selected = new EventEmitter<SelectedDocument[]>();
@Output()
  activate = new EventEmitter<SelectedDocument[]>();

  subscriptions: Subscription[] = [];

  copiedNodes: TreeNode[] = [];
  cutNodes: TreeNode[] = [];


  treeControl: FlatTreeControl < DynamicFlatNode >;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => {
    return node.level;
  };

  isExpandable = (node: DynamicFlatNode) => {
    return node.expandable;
  };

  hasChild = (_: number, _nodeData: DynamicFlatNode) => {
    return _nodeData.expandable;
  };

  constructor( database: DynamicDatabase, private storageService: StorageService, private router: Router,
               private route: ActivatedRoute, private formularService: FormularService, private errorService: ErrorService,
               private toolbarService: FormToolbarService, private profileService: ProfileService) {

    this.treeControl = new FlatTreeControl<DynamicFlatNode>( this.getLevel, this.isExpandable );
    this.dataSource = new DynamicDataSource( this.treeControl, database );

    database.initialData().then( rootNodes => this.dataSource.data = rootNodes );
  }

  ngOnInit() {
    /*this.profileService.initialized.then( () => {

      this.query( null, null ).then( () => {
        const initialSet = this.route.params.subscribe( params => {
          const selectedId = params['id'];

          // only let this function be called once, since we only need it during first visit of the page
          setTimeout( () => initialSet.unsubscribe(), 0 );

          if (selectedId) {
            // get path to node
            this.subscriptions.push( this.storageService.getPathToDataset( selectedId ).subscribe( path => {
              console.log( 'path: ' + path );
              this.expandToPath( this.nodes, path.reverse() )
                .then( () => {
                  this.open( null );
                } );
            } ) );
          }
        } );
      }, (err) => console.error( 'Error:', err ) );

      this.subscriptions.push(
        this.storageService.datasetsChanged$.subscribe( (info) => {
          console.log( 'Tree: dataset changed event', info );
          // only update changes in the tree instead of reloading everything and recover previous state
          switch (info.type) {
            case UpdateType.New:
              // this.onNewDataset(info.data);
              break;

            case UpdateType.Update:
              this.onUpdateDataset( info.data );
              break;

            case UpdateType.Delete:
              this.onDeleteDataset( info.data );
              break;
            case UpdateType.Copy:
              // this.copy();
              break;
            case UpdateType.Paste:
              // this.paste();
              break;
          }
        } )
      );

      // inform interested components which documents are selected
      // this.formularService.selectedDocuments$.subscribe( (ids) => {
      //   ids.push(this.selectedId);
      // });

      // this.handleToolbarEvents();
    } );*/
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( _ => _.unsubscribe() );
}


  onNewDataset(docs: DocMainInfo[]) {
    docs.forEach( doc => {
      const newDataset = this.createNewDatasetTemplate( doc );

      const updateTree = (id: string) => {
        // this.tree.treeModel.update();
        // FIXME: set route to new node id, for correct refresh
        // this however does conflict when creating a new node when first visiting the form page
        // this.router.navigate( ['/form', id] );

        /* const node = this.tree.treeModel.getNodeById( id );

         // make sure parent is expanded
         node.parent.expand();

         this.tree.treeModel.setActiveNode( node, true );*/
      };

      if (doc._parent) {

        const node = this.flatNodes.filter( n => n.data.id === doc._parent )[0];

        this.loadNode( {node: node} ).then( () => {
          const newChild = this.flatNodes.filter( n => n.data.id === doc._id )[0];
          // node.leaf = false;
          // node will be already added implicitly by query after save
          this.selectedNodes = [newChild];
        } );

        /*const parentNode = this.tree.treeModel.getNodeById( doc._parent );
        // TODO: make it bullet proof by expecting a promise from expand
        try {
          // parentNode.expand().then( () => {
            const pNode = this.getNodeFromModel( doc._parent );

            // let pNode = this.nodes.filter( node => node.id === info.data._parent)[0];
            if (!pNode.children) {
              pNode.children = [];
            }
            pNode.children.push( newDataset );
            updateTree( newDataset.id );
          // } );
        } catch (err) {
          console.error( 'error expanding node', err );
        }*/
      } else {
        this.nodes.push( newDataset );
        this.selectedNodes = [newDataset];
      }

      // add node to flat list for easier management
      this.flatNodes.push( newDataset );

    } );
  }

  private createNewDatasetTemplate(doc: any) {
    const name = this.formularService.getTitle( doc._profile, doc );

    const docNode = this.prepareNode( doc );
    return docNode;
  }

  onUpdateDataset(docs: DocMainInfo[]) {
    docs.forEach( doc => {

      const node = this.flatNodes.filter( n => n.data.id === doc._id );
      Object.assign( node[0], this.prepareNode( doc ) );

    } );
  }

  onDeleteDataset(docs: DocMainInfo[]) {

    docs.forEach( doc => {
      const node = this.flatNodes.filter( _ => _.data.id === doc._id )[0];

      const parentNode = node.parent;
      const parentNodeChildren = parentNode ? parentNode.children : this.nodes;
      const index = parentNodeChildren.findIndex( (c: TreeNode) => c.data.id === doc._id );

      // only remove node from tree if it's still there
      // TODO: optimize by call update only once after all docs are removed from tree
      if (index !== -1) {
        parentNodeChildren.splice( index, 1 );
        // remove expansion property from node if it does not have any children anymore
        if (parentNodeChildren.length === 0 && parentNode) {
          parentNode.leaf = true;
        }
      }
    } );
  }

  expandToPath(children: TreeNode[], path: string[]) {
    const id = path.pop();

    return new Promise( (resolve, reject) => {

      if (path.length > 0) {
        this.nodes.some( n => {
          if (n.data.id === id) {
            this.loadNode( {node: n} ).then( () => {
              n.expanded = true;
              return this.expandToPath( n.children, path );
            } ).then( () => {
              resolve();
            } );
            return true;
          } else {
            // resolve();
          }
        } );
      } else {
        // select node
        this.selectedNodes = children.filter( n => n.data.id === id );
        resolve();
      }
    } );
  }

  loadNode(event): Promise<any> {
    if (event.node) {
      // return this.query( event.node.data.id );
      return this.dataSource.toggleNode(event.node.data.id, true);
    }
  }


  prepareNode(doc: any): any {
    const node: any = {
      data: {
        id: doc._id + '',
        _profile: doc._profile,
        _state: doc._state
      },
      label: this.formularService.getTitle( doc._profile, doc ),
      icon: this.getTreeIcon( doc ),
      leaf: true
    };
    if (doc._hasChildren === 'true') { // TODO: expect real boolean value!
      node.leaf = false;
    }

    return node;
  }

  getTreeIcon(doc): string {
    const classType = this.formularService.getIconClass( doc._profile );
    const classState = doc._state === 'P'
      ? 'badge-primary'
      : doc._state === 'W'
        ? 'badge-warning'
        : 'pubished-working-label';

    return classType + ' ' + classState;
  }

  private getSelectedNodes(nodes: DynamicFlatNode[]): SelectedDocument[] {
    return nodes
      .map( node => ({
        id: node.id,
        label: node.label,
        profile: node.profile,
        state: node.state
      }) );
  }

  open( node: DynamicFlatNode ) {
    const data = this.getSelectedNodes( [node] );

    this.activate.next( data );
    this.selected.next( data );
  }

  /*  refresh(): Promise<any> {
      this.nodes = [];
      this.flatNodes = [];
      return this.query( null, null );
    }*/

  /*
    deselected(event: TreeNode) {
      const data = this.getSelectedNodes();

      this.selected.next( data );
    }

    editFolder(data: any) {
      // this.router.navigate( ['/form', data.id], { queryParams: { editMode: true } } );
      this.activate.next( [
        {id: data.id, label: data.name, profile: data.profile, forceLoad: true}
      ] );
    }

    private handleToolbarEvents() {
      this.toolbarService.toolbarEvent$.subscribe( eventId => {
        if (eventId === 'COPY') {
          this.copy();
        } else if (eventId === 'CUT') {
          this.cut();
        } else if (eventId === 'PASTE') {
          this.paste();
        }
      } );
    }

    private copy() {
      this.copiedNodes = this.tree.treeModel.getActiveNodes();
    }

    private cut() {
      this.cutNodes = this.tree.treeModel.getActiveNodes();
    }

    private paste() {
      // send event to paste nodes in backend
      // NO -> we only make sure that the tree updates correctly and the init event has to do the backend action

      // insert/move nodes or just refresh?

    }*/
}
