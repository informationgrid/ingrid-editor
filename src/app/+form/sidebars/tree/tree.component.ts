import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularService } from '../../../services/formular/formular.service';
import { ErrorService } from '../../../services/error.service';
import { FormToolbarService } from '../../toolbar/form-toolbar.service';
import { SelectedDocument } from '../selected-document.model';
import { DocMainInfo } from '../../../models/update-dataset-info.model';
import { Subscription } from 'rxjs/index';
import { FlatTreeControl } from '@angular/cdk/tree';
import { UpdateType } from '../../../models/update-type.enum';
import { DynamicDatabase } from './DynamicDatabase';
import { DynamicFlatNode } from './DynamicFlatNode';
import { DynamicDataSource } from './DynamicDataSource';


@Component( {
  selector: 'ige-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
  providers: [DynamicDatabase]
} )
export class MetadataTreeComponent implements OnInit, OnDestroy {

  selectedNodes: DynamicFlatNode[];


  @Input() showFolderEditButton = true;
  @Output() selected = new EventEmitter<SelectedDocument[]>();
  @Output() activate = new EventEmitter<SelectedDocument[]>();

  subscriptions: Subscription[] = [];

  copiedNodes: any[] = [];
  cutNodes: any[] = [];


  treeControl: FlatTreeControl<DynamicFlatNode>;

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

  constructor(private database: DynamicDatabase, private storageService: StorageService, private router: Router,
              private route: ActivatedRoute, private formularService: FormularService) {

    this.treeControl = new FlatTreeControl<DynamicFlatNode>( this.getLevel, this.isExpandable );
    this.dataSource = new DynamicDataSource( this.treeControl, database, formularService );

  }

  ngOnInit() {
    /*this.profileService.initialized.then( () => {

      this.query( null, null ).then( () => {
      }, (err) => console.error( 'Error:', err ) );
*/
    this.database.initialData()
      .then( rootNodes => this.dataSource.data = rootNodes )
      .then( () => {
        // get route parameter and expand to defined node
        const initialSet = this.route.params.subscribe( params => {
          const selectedId = params['id'];

          // only let this function be called once, since we only need it during first visit of the page
          setTimeout( () => initialSet.unsubscribe(), 0 );

          if (selectedId) {
            // get path to node
            this.subscriptions.push( this.storageService.getPathToDataset( selectedId ).subscribe( path => {
              console.log( 'path: ' + path );
              this.expandToPath( path.reverse() )
                .then( () => {
                  this.open( this.selectedNodes[0] );
                } );
            } ) );
          }
        } );
      });

    this.subscriptions.push(
      this.storageService.datasetsChanged$.subscribe( (info) => {
        console.log( 'Tree: dataset changed event', info );
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
            // this.copy();
            break;
          case UpdateType.Paste:
            // this.paste();
            break;
        }
      } )
    );
    /*
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
      this.dataSource.addChildNode( doc._parent, doc );

      /*const newDataset = this.createNewDatasetTemplate( doc );

      const updateTree = (id: string) => {
        // this.tree.treeModel.update();
        // FIXME: set route to new node id, for correct refresh
        // this however does conflict when creating a new node when first visiting the form page
        // this.router.navigate( ['/form', id] );

        /!* const node = this.tree.treeModel.getNodeById( id );

         // make sure parent is expanded
         node.parent.expand();

         this.tree.treeModel.setActiveNode( node, true );*!/
      };

      if (doc._parent) {

        const node = this.flatNodes.filter( n => n.data.id === doc._parent )[0];

        this.loadNode( {node: node} ).then( () => {
          const newChild = this.flatNodes.filter( n => n.data.id === doc._id )[0];
          // node.leaf = false;
          // node will be already added implicitly by query after save
          this.selectedNodes = [newChild];
        } );

        /!*const parentNode = this.tree.treeModel.getNodeById( doc._parent );
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
        }*!/
      } else {
        this.nodes.push( newDataset );
        this.selectedNodes = [newDataset];
      }

      // add node to flat list for easier management
      this.flatNodes.push( newDataset );
*/
    } );
  }

  // private createNewDatasetTemplate(doc: any) {
    // const name = this.formularService.getTitle( doc._profile, doc );

    // const docNode = this.prepareNode( doc );
    // return docNode;
  // }

  onUpdateDataset(docs: DocMainInfo[]) {
    const mappedDocs = this.database.prepareNodes(docs);
    mappedDocs.forEach( doc => {
      this.dataSource.updateNode(doc._id, doc);
    } );
  }

  onDeleteDataset(docs: DocMainInfo[]) {

    docs.forEach( doc => {
      this.dataSource.removeNode(doc._id);
    } );
  }

  expandToPath(path: string[]) {
    const id = path.pop();

    return new Promise( (resolve, reject) => {

      if (path.length > 0) {
        const node = this.dataSource.data
          .filter(n => n.id === id);

        if (node.length > 0) {
          this.dataSource.toggleNode(node[0], true)
            .then( () => this.expandToPath(path))
            .then( () => resolve );
            return true;
          }
      } else {
        // select node
        this.selectedNodes = this.dataSource.data.filter( n => n.id === id );
        resolve();
      }
    } );
  }

  loadNode(event): Promise<any> {
    if (event.node) {
      // return this.query( event.node.data.id );
      return this.dataSource.toggleNode( event.node.data.id, true );
    }
  }


/*  prepareNode(doc: any): any {
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
  }*/

  private getSelectedNodes(nodes: DynamicFlatNode[]): SelectedDocument[] {
    return nodes
      .map( node => ({
        id: node.id,
        label: node.label,
        profile: node.profile,
        state: node.state
      }) );
  }

  open(node: DynamicFlatNode) {
    this.selectedNodes = [node];
    const data = this.getSelectedNodes( this.selectedNodes );

    this.activate.next( data );
    this.selected.next( data );
  }

  refresh(): Promise<any> {
    return this.dataSource.reload();
  }

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
