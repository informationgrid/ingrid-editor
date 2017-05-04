import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {StorageService} from '../../../services/storage/storage.service';
import {TreeComponent, TreeNode} from 'angular-tree-component';
import {Router, ActivatedRoute} from '@angular/router';
import {FormularService} from '../../../services/formular/formular.service';
import {UpdateType} from '../../../models/update-type.enum';
import {ErrorService} from '../../../services/error.service';
import {FormToolbarService} from '../../toolbar/form-toolbar.service';
import {Promise} from 'es6-promise';

@Component({
  selector: 'tree',
  template: require('./tree.component.html'),
  styles: [`
    .clickable { cursor: pointer; text-decoration: none; }
    .folder { position: absolute;right: 5px;margin-top: -15px; display: none;}
    .refresh { position: absolute; right: 0; z-index: 1000 }
  `]
})
export class MetadataTreeComponent implements OnInit {

  @ViewChild(TreeComponent) private tree: TreeComponent;

  @Input() showFolderEditButton = true;
  @Output() onSelected = new EventEmitter<any>();

  nodes: any[] = [];
  selectedId: string = '';

  copiedNodes: TreeNode[] = [];
  cutNodes: TreeNode[] = [];

  options = {
    getChildren: (node: TreeNode) => {
      console.debug( 'get children ...', node.id );
      return this.query(node.id);
    }
  };

  constructor(private storageService: StorageService, private router: Router, private route: ActivatedRoute,
              private formularService: FormularService, private errorService: ErrorService,
              private toolbarService: FormToolbarService) {
  }

  ngOnInit() {
    this.query(null).then( () => {
      let initialSet = this.route.params.subscribe(params => {
        this.selectedId = params['id'];

        // only let this function be called once, since we only need it during first visit of the page
        setTimeout(() => initialSet.unsubscribe(), 0);

        if (this.selectedId && this.selectedId !== '-1' && this.selectedId !== '-2') {
          // get path to node
          this.storageService.getPathToDataset( this.selectedId ).subscribe( path => {
            console.debug( 'path: ' + path );
            this.expandToPath( path.reverse() );
          } );
        }
      });
    }, (err) => console.error( 'Error:', err ));

    this.storageService.datasetsChanged$.subscribe( (info) => {
      console.debug( 'Tree: dataset changed event', info );
      // only update changes in the tree instead of reloading everything and recover previous state
      switch (info.type) {
        case UpdateType.New:
          this.onNewDataset(info.data);
          break;

        case UpdateType.Update:
          this.onUpdateDataset(info.data);
          break;

        case UpdateType.Delete:
          this.onDeleteDataset(info.data);
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
    this.formularService.selectedDocuments$.subscribe( (ids) => {
      ids.push(this.selectedId);
    });

    this.handleToolbarEvents();
  }

  onNewDataset(doc: any) {
    let newDataset = this.createNewDatasetTemplate(doc);

    let updateTree = () => {
      this.tree.treeModel.update();
      // FIXME: set route to new node id, for correct refresh
      // this however does conflict when creating a new node when first visiting the form page
      this.router.navigate(['/form', '-1']);

      let node = this.tree.treeModel.getNodeById('-1');
      this.tree.treeModel.setActiveNode(node, true);
    };

    if (doc._parent) {
      let parentNode = this.tree.treeModel.getNodeById(doc._parent);
      // TODO: make it bullet proof by expecting a promise from expand
      try {
        parentNode.expand();
      } catch (err) {
        console.error( 'error expanding node', err );
      }
      setTimeout(() => {
        let pNode = this.getNodeFromModel(doc._parent);

        // let pNode = this.nodes.filter( node => node.id === info.data._parent)[0];
        if (!pNode.children) pNode.children = [];
        pNode.children.push( newDataset );
        updateTree();
      }, 100);
    } else {
      this.nodes.push( newDataset );
      updateTree();
    }
  }

  private createNewDatasetTemplate(doc: any) {
    let name = this.formularService.getTitle(doc._profile, doc);

    return {
      id: doc._id ? doc._id : '-1',
      name: name && name !== this.formularService.untitledLabel ? name : 'Neuer Datensatz',
      _profile: doc._profile,
      _state: 'W',
      _iconClass: this.formularService.getIconClass(doc._profile)
    };
  }

  onUpdateDataset(doc: any) {
    // when a new node (with id="-1") is saved than it gets a new ID
    // but we have to find the node to be replaced by it's old one
    let id = doc._previousId ? doc._previousId : doc._id;

    let nodeParentUpdate = this.getNodeFromModel(id);
    Object.assign(nodeParentUpdate, this.prepareNode(doc));
    this.tree.treeModel.update();

    // re-select node if id has changed (after a new dataset has been saved and given an id)
    if (doc._previousId !== doc._id) {
      let node = this.tree.treeModel.getNodeById(doc._id);
      this.tree.treeModel.setActiveNode(node, true);
    }
  }

  onDeleteDataset(doc: any) {
    let path = this.getNodeIdPath(doc._id);

    if (!path) {
      console.warn('path is null after delete!?', doc);
      return;
    }

    // since we don't have the parent we determine the parent from the node path
    // and get the parent from that to finally get the wanted node from the model
    let nodeParent = this.getNodeFromModel(path[path.length - 2]);

    let index = nodeParent.children.findIndex( (c: any) => c.id === doc._id );

    // only remove node from tree if it's still there
    if (index !== -1) {
      nodeParent.children.splice(index, 1);
      this.tree.treeModel.update();
    }
  }

  getNodeIdPath(id: string): string[] {
    let path: string[] = null;
    if (id) {
      let parentNode = this.tree.treeModel.getNodeById(id);
      if (parentNode) path = parentNode.path;
    }
    return path;
  }

  getNodeFromModel(id: string): any {
    let nodeParent: any = null;

    let path = this.getNodeIdPath(id);

    if (path) {
      let kids = this.nodes;
      path.forEach( id => {
        kids.some(child => {
          if (child.id === id) {
            nodeParent = child;
            kids = child.children;
            return true;
          }
        });
      });
    } else {
      nodeParent = {children: this.nodes};
    }
    return nodeParent;
  }

  expandToPath(path: string[]): Promise<any> {
    let id = path.pop();
    let node = this.tree.treeModel.getNodeById( id );

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
        console.warn('Could not find node to set active: ' + id);
      }
      return Promise.resolve();
    }
  }

  query(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storageService.getChildDocuments(id).subscribe(response => {
        console.debug( 'got children', response );
        try {
          this.setNodes(response, id);
        } catch (error) {
          reject(error);
          return;
        }
        resolve();
      }, (err) => this.errorService.handle(err));
    });
  }

  prepareNode(doc: any): any {
    let node: any = {
      id: doc._id + '',
      name: this.formularService.getTitle(doc._profile, doc),
      _iconClass: this.formularService.getIconClass(doc._profile),
      _profile: doc._profile,
      _state: doc._state
    };
    if (doc.hasChildren) {
      node.hasChildren = true;
    }

    return node;
  }

  setNodes(docs: any[], parentId: string) {
    let updatedNodes: any = this.nodes;
    if (parentId) {
      updatedNodes = this.getNodeFromModel(parentId);
      updatedNodes.children = [];
    }

    docs
      .filter( doc => doc._profile !== undefined )
      .forEach( doc => {
        if (parentId) {
          updatedNodes.children.push(this.prepareNode(doc));
        } else {
          updatedNodes.push(this.prepareNode(doc));
        }
      });
    this.tree.treeModel.update();
  }

  open(event: any) {
    if (event.eventName === 'onActivate') {
      this.selectedId = event.node.id;
      this.onSelected.next({id: event.node.id, profile: event.node.data._profile});
    }
  }

  editFolder(data: any) {
    // this.router.navigate( ['/form', data.id], { queryParams: { editMode: true } } );
    this.onSelected.next({id: data.id, profile: data.profile, forceLoad: true});
  }

  refresh(): Promise<any> {
    this.nodes = [];
    this.tree.treeModel.expandedNodeIds = {};
    // this.tree.treeModel.expandedNodes = [];
    this.tree.treeModel.activeNodeIds = {};
    // this.tree.treeModel.activeNodes = [];
    return this.query(null);
  }

  private handleToolbarEvents() {
    this.toolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'COPY') {
        this.copy();
      } else if (eventId === 'CUT') {
        this.cut();
      } else if (eventId === 'PASTE') {
        this.paste();
      }
    });
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