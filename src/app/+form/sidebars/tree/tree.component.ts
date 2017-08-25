import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {StorageService} from '../../../services/storage/storage.service';
import {IActionMapping, ITreeOptions, TREE_ACTIONS, TreeComponent, TreeModel, TreeNode} from 'angular-tree-component';
import {Router, ActivatedRoute} from '@angular/router';
import {FormularService} from '../../../services/formular/formular.service';
import {UpdateType} from '../../../models/update-type.enum';
import {ErrorService} from '../../../services/error.service';
import {FormToolbarService} from '../../toolbar/form-toolbar.service';
import {SelectedDocument} from '../selected-document.model';
import {DocMainInfo} from '../../../models/update-dataset-info.model';
import {TREE_EVENTS} from 'angular-tree-component/dist/constants/events';

const actionMapping: IActionMapping = {
  mouse: {
    click(tree, node, $event) {
      $event.ctrlKey
        ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI( tree, node, $event )
        : TREE_ACTIONS.SELECT( tree, node, $event )
    }
  }
};

@Component( {
  selector: 'tree',
  templateUrl: './tree.component.html',
  styles: [`
    .clickable {
      cursor: pointer;
      text-decoration: none;
    }

    .folder {
      position: absolute;
      right: 5px;
      margin-top: -15px;
      display: none;
    }

    .refresh {
      position: absolute;
      right: 0;
      z-index: 1000
    }
  `]
} )
export class MetadataTreeComponent implements OnInit {

  @ViewChild( TreeComponent ) private tree: TreeComponent;

  @Input() showFolderEditButton = true;
  @Output() selected = new EventEmitter<SelectedDocument[]>();
  @Output() activate = new EventEmitter<SelectedDocument[]>();

  nodes: any[] = [];

  copiedNodes: TreeNode[] = [];
  cutNodes: TreeNode[] = [];


  options: ITreeOptions = {
    getChildren: (node: TreeNode) => {
      console.debug( 'get children ...', node.id );
      return this.query( node.id );
    },
    actionMapping
  };

  constructor(private storageService: StorageService, private router: Router, private route: ActivatedRoute,
              private formularService: FormularService, private errorService: ErrorService,
              private toolbarService: FormToolbarService) {
  }

  ngOnInit() {
    this.query( null ).then( () => {
      const initialSet = this.route.params.subscribe( params => {
        const selectedId = params['id'];

        // only let this function be called once, since we only need it during first visit of the page
        setTimeout( () => initialSet.unsubscribe(), 0 );

        if (selectedId && selectedId !== '-1') {
          // get path to node
          this.storageService.getPathToDataset( selectedId ).subscribe( path => {
            console.debug( 'path: ' + path );
            this.expandToPath( path.reverse() );
          } );
        }
      } );
    }, (err) => console.error( 'Error:', err ) );

    this.storageService.datasetsChanged$.subscribe( (info) => {
      console.debug( 'Tree: dataset changed event', info );
      // only update changes in the tree instead of reloading everything and recover previous state
      switch (info.type) {
        case UpdateType.New:
          this.onNewDataset( info.data );
          break;

        case UpdateType.Update:
          this.onUpdateDataset( info.data );
          break;

        case UpdateType.Delete:
          this.onDeleteDataset( info.data );
          break;
        case UpdateType.Copy:
          this.copy();
          break;
        case UpdateType.Paste:
          this.paste();
          break;
      }
    } );

    // inform interested components which documents are selected
    // this.formularService.selectedDocuments$.subscribe( (ids) => {
    //   ids.push(this.selectedId);
    // });

    this.handleToolbarEvents();
  }

  onNewDataset(docs: DocMainInfo[]) {
    docs.forEach( doc => {
      const newDataset = this.createNewDatasetTemplate( doc );

      const updateTree = () => {
        this.tree.treeModel.update();
        // FIXME: set route to new node id, for correct refresh
        // this however does conflict when creating a new node when first visiting the form page
        this.router.navigate( ['/form', '-1'] );

        const node = this.tree.treeModel.getNodeById( '-1' );

        // make sure parent is expanded
        node.parent.expand();

        this.tree.treeModel.setActiveNode( node, true );
      };

      if (doc._parent) {
        const parentNode = this.tree.treeModel.getNodeById( doc._parent );
        // TODO: make it bullet proof by expecting a promise from expand
        try {
          // parentNode.expand().then( () => {
            const pNode = this.getNodeFromModel( doc._parent );

            // let pNode = this.nodes.filter( node => node.id === info.data._parent)[0];
            if (!pNode.children) {
              pNode.children = [];
            }
            pNode.children.push( newDataset );
            updateTree();
          // } );
        } catch (err) {
          console.error( 'error expanding node', err );
        }
      } else {
        this.nodes.push( newDataset );
        updateTree();
      }
    } );
  }

  private createNewDatasetTemplate(doc: any) {
    const name = this.formularService.getTitle( doc._profile, doc );

    return {
      id: doc._id ? doc._id : '-1',
      name: name && name !== this.formularService.untitledLabel ? name : 'Neuer Datensatz',
      _profile: doc._profile,
      _state: 'W',
      _iconClass: this.formularService.getIconClass( doc._profile )
    };
  }

  onUpdateDataset(docs: DocMainInfo[]) {
    docs.forEach( doc => {

      // when a new node (with id="-1") is saved than it gets a new ID
      // but we have to find the node to be replaced by it's old one
      const id = doc._previousId ? doc._previousId : doc._id;

      const nodeParentUpdate = this.getNodeFromModel( id );
      Object.assign( nodeParentUpdate, this.prepareNode( doc ) );
      this.tree.treeModel.update();

      // re-select node if id has changed (after a new dataset has been saved and given an id)
      if (doc._previousId !== doc._id) {
        const node = this.tree.treeModel.getNodeById( doc._id );
        this.tree.treeModel.setActiveNode( node, true );
      }
    } );
  }

  onDeleteDataset(docs: DocMainInfo[]) {

    docs.forEach( doc => {
      const path = this.getNodeIdPath( doc._id );

      if (!path) {
        console.warn( 'path is null after delete!?', doc );
        return;
      }

      // since we don't have the parent we determine the parent from the node path
      // and get the parent from that to finally get the wanted node from the model
      const nodeParent = this.getNodeFromModel( path[path.length - 2] );

      const index = nodeParent.children.findIndex( (c: any) => c.id === doc._id );

      // only remove node from tree if it's still there
      // TODO: optimize by call update only once after all docs are removed from tree
      if (index !== -1) {
        nodeParent.children.splice( index, 1 );
        this.tree.treeModel.update();
      }
    } );
  }

  getNodeIdPath(id: string): string[] {
    let path: string[] = null;
    if (id) {
      const parentNode = this.tree.treeModel.getNodeById( id );
      if (parentNode) {
        path = parentNode.path;
      }
    }
    return path;
  }

  getNodeFromModel(id: string): any {
    let nodeParent: any = null;

    const path = this.getNodeIdPath( id );

    if (path) {
      let kids = this.nodes;
      path.forEach( id => {
        kids.some( child => {
          if (child.id === id) {
            nodeParent = child;
            kids = child.children;
            return true;
          }
        } );
      } );
    } else {
      nodeParent = {children: this.nodes};
    }
    return nodeParent;
  }

  expandToPath(path: string[]): Promise<any> {
    const id = path.pop();
    const node = this.tree.treeModel.getNodeById( id );

    // only expand if there're more nodes to be expanded
    if (path.length > 0) {
      return node.expand().then( () => {
        return this.expandToPath( path );
      } );
    } else {
      // mark the last node as active
      if (node !== undefined) {
        setTimeout( () => this.tree.treeModel.setActiveNode( node, true ), 100 );
      } else {
        console.warn( 'Could not find node to set active: ' + id );
      }
      return Promise.resolve();
    }
  }

  query(id: string): Promise<any> {
    return new Promise( (resolve, reject) => {
      this.storageService.getChildDocuments( id ).subscribe( response => {
        console.debug( 'got children', response );
        try {
          this.setNodes( response, id );
        } catch (error) {
          reject( error );
          return;
        }
        resolve();
      }, (err) => this.errorService.handle( err ) );
    } );
  }

  prepareNode(doc: any): any {
    const node: any = {
      id: doc._id + '',
      name: this.formularService.getTitle( doc._profile, doc ),
      _iconClass: this.formularService.getIconClass( doc._profile ),
      _profile: doc._profile,
      _state: doc._state
    };
    if (doc._hasChildren) {
      node.hasChildren = true;
    }

    return node;
  }

  setNodes(docs: any[], parentId: string) {
    let updatedNodes: any = this.nodes;
    if (parentId) {
      updatedNodes = this.getNodeFromModel( parentId );
      updatedNodes.children = [];
    }

    docs
      .filter( doc => doc._profile !== undefined )
      .sort( (doc1, doc2) => {
        return this.formularService.getTitle(doc1._profile, doc1).localeCompare(this.formularService.getTitle(doc2._profile, doc2))
      } )
      .forEach( doc => {
        if (parentId) {
          updatedNodes.children.push( this.prepareNode( doc ) );
        } else {
          updatedNodes.push( this.prepareNode( doc ) );
        }
      } );
    this.tree.treeModel.update();
  }

  private getSelectedNodes(treeModel: TreeModel): any {
    return treeModel.getActiveNodes()
      .map( node => ({
        id: node.data.id,
        label: node.displayField,
        profile: node.data._profile
      } ) );
  }

  open(event: TreeNode) {
    const data = this.getSelectedNodes( event.treeModel );

    this.activate.next( data );
    this.selected.next( data );
  }

  deselected(event: TreeNode) {
    const data = this.getSelectedNodes( event.treeModel );

    this.selected.next( data );
  }

  editFolder(data: any) {
    // this.router.navigate( ['/form', data.id], { queryParams: { editMode: true } } );
    this.activate.next( [
      {id: data.id, label: data.name, profile: data.profile, forceLoad: true}
    ] );
  }

  refresh(): Promise<any> {
    this.nodes = [];
    this.tree.treeModel.expandedNodeIds = {};
    // this.tree.treeModel.expandedNodes = [];
    this.tree.treeModel.activeNodeIds = {};
    // this.tree.treeModel.activeNodes = [];
    return this.query( null );
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

  }
}
