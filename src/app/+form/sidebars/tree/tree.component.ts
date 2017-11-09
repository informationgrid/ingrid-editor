import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularService } from '../../../services/formular/formular.service';
import { ErrorService } from '../../../services/error.service';
import { FormToolbarService } from '../../toolbar/form-toolbar.service';
import { SelectedDocument } from '../selected-document.model';
import { Subscription } from 'rxjs/Subscription';
import { TreeNode } from 'primeng/primeng';
import { UpdateType } from '../../../models/update-type.enum';
import { DocMainInfo } from '../../../models/update-dataset-info.model';

@Component({
  selector: 'ige-tree',
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
})
export class MetadataTreeComponent implements OnInit, OnDestroy {

  nodes: TreeNode[] = [];
  flatNodes: TreeNode[] = [];

  selectedNodes: TreeNode[];


  @Input() showFolderEditButton = true;
  @Output() selected = new EventEmitter<SelectedDocument[]>();
  @Output() activate = new EventEmitter<SelectedDocument[]>();

  subscriptions: Subscription[] = [];

  copiedNodes: TreeNode[] = [];
  cutNodes: TreeNode[] = [];

  /*@ViewChild( TreeComponent ) private tree: TreeComponent;

*/

  constructor(private storageService: StorageService, private router: Router, private route: ActivatedRoute,
              private formularService: FormularService, private errorService: ErrorService,
              private toolbarService: FormToolbarService) {
  }

  ngOnInit() {
    this.query(null, null).then(() => {
      const initialSet = this.route.params.subscribe(params => {
        const selectedId = params['id'];

        // only let this function be called once, since we only need it during first visit of the page
        setTimeout(() => initialSet.unsubscribe(), 0);

        if (selectedId) {
          // get path to node
          this.subscriptions.push(this.storageService.getPathToDataset(selectedId).subscribe(path => {
            console.log('path: ' + path);
            this.expandToPath(this.nodes, path.reverse());
            this.selectedNodes = this.nodes.filter(n => n.data.id === path[0]);
            this.open(null);
          }));
        }
      });
    }, (err) => console.error('Error:', err));

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

    // inform interested components which documents are selected
    // this.formularService.selectedDocuments$.subscribe( (ids) => {
    //   ids.push(this.selectedId);
    // });

    // this.handleToolbarEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(_ => _.unsubscribe());
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

        const node = this.flatNodes.filter(n => n.data.id === doc._parent)[0];

        this.loadNode( { node: node } ).then( () => {
          const newChild = this.flatNodes.filter(n => n.data.id === doc._id)[0];
          // node.leaf = false;
          // node will be already added implicitly by query after save
          this.selectedNodes = [newChild];
        });

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

      const node = this.flatNodes.filter(n => n.data.id === doc._id);
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

    if (path.length > 0) {
      this.nodes.some(n => {
        if (n.data.id === id) {
          this.loadNode({node: n}).then( () => {
            n.expanded = true;
            this.expandToPath(n.children, path);
          });
          return true;
        }
      });
    } else {
      // select node
      this.selectedNodes = children.filter(n => n.data.id === id );
    }

    // only expand if there're more nodes to be expanded
    // if (path.length > 0) {
    //   return node.expand().then( () => {
    //     return this.expandToPath( path );
    //   } );
    // } else {
    //   // mark the last node as active
    //   if (node !== undefined) {
    //     setTimeout( () => this.tree.treeModel.setActiveNode( node, true ), 100 );
    //   } else {
    //     console.warn( 'Could not find node to set active: ' + id );
    //   }
    //   return Promise.resolve();
    // }
  }

  loadNode(event): Promise<any> {
    if (event.node) {
      return this.query(event.node, event.node.data.id);
    }
  }

  query(node: TreeNode, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storageService.getChildDocuments(id).subscribe(response => {
        console.log('got children', response);
        try {
          this.setNodes(response, node);
        } catch (error) {
          reject(error);
          return;
        }
        resolve();
      }, (err) => this.errorService.handle(err));
    });
  }

  prepareNode(doc: any): any {
    const node: any = {
      data: {
        id: doc._id + '',
        _profile: doc._profile,
        _state: doc._state
      },
      label: this.formularService.getTitle(doc._profile, doc),
      icon: this.formularService.getIconClass(doc._profile),
      leaf: true
    };
    if (doc._hasChildren === 'true') { // TODO: expect real boolean value!
      node.leaf = false;
    }

    return node;
  }

  setNodes(docs: any[], parentNode: TreeNode) {
    if (parentNode && !parentNode.children) {
      parentNode.leaf = false;
      parentNode.children = [];
    }

    const updatedNodes: any = parentNode ? parentNode : this.nodes;

    docs
      .filter(doc => doc._profile !== undefined)
      .sort((doc1, doc2) => { // TODO: sort after conversion, then we don't need to call getTitle function
        return this.formularService.getTitle(doc1._profile, doc1).localeCompare(this.formularService.getTitle(doc2._profile, doc2));
      })
      .forEach(doc => {
        const newNode = this.prepareNode(doc);
        if (parentNode) {
          updatedNodes.children.push(newNode);
        } else {
          updatedNodes.push(newNode);
        }
        this.flatNodes.push(newNode);
      });
    // this.tree.treeModel.update();
  }

  private getSelectedNodes(nodes: TreeNode[]): any {
    return nodes
      .map(node => ({
        id: node.data.id,
        label: node.label,
        profile: node.data._profile
      }));
  }

  open(event: TreeNode) {
    const data = this.getSelectedNodes(this.selectedNodes);

    this.activate.next(data);
    this.selected.next(data);
  }

  refresh(): Promise<any> {
    this.nodes = [];
    this.flatNodes = [];
    return this.query(null, null);
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
