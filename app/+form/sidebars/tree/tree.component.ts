import {Component, OnInit, ViewChild} from '@angular/core';
import {StorageService} from '../../../services/storage/storage.service';
// import {TreeComponent, TreeNode} from 'angular2-tree-component';
import {TreeComponent, TreeNode} from '../../../_forks/angular2-tree-component/angular2-tree-component';
import {Router, ActivatedRoute} from '@angular/router';
import {FormularService} from '../../../services/formular/formular.service';
import {UpdateType} from '../../../models/update-type.enum';

@Component({
  selector: 'tree',
  template: require('./tree.component.html'),
  styles: [`
    .clickable { cursor: pointer; text-decoration: none; }
  `]
})
export class MetadataTreeComponent implements OnInit {

  @ViewChild(TreeComponent) private tree: TreeComponent;

  nodes: any[] = [];
  selectedId: string = '';

  options = {
    getChildren: (node: TreeNode) => {
      console.debug( 'get children ...', node.id );
      return this.query(node.id);
    }
  };

  constructor(private storageService: StorageService, private router: Router, private route: ActivatedRoute,
              private formularService: FormularService) {
  }

  ngOnInit() {
    this.query(null).then( () => {
      this.route.params.subscribe(params => {
        this.selectedId = params['id'];

        if (this.selectedId && this.selectedId !== '-1') {
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
      }
    } );
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
    return {
      id: '-1',
      name: 'Neuer Datensatz',
      _profile: doc._profile,
      _state: 'W'
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
      path = parentNode.path;
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
      setTimeout( () => this.tree.treeModel.setActiveNode( node, true ), 100 );
      return Promise.resolve();
    }
  }

  query(id: string): Promise<any> {
    return new Promise(resolve => {
      this.storageService.getChildDocuments(id).subscribe(response => {
        console.debug( 'got children', response );
        this.setNodes(response, id);
        resolve();
      });
    });
  }

  prepareNode(doc: any): any {
    let node: any = {
      id: doc._id,
      name: this.formularService.getTitle(doc._profile, doc),
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

  open(id: string) {
    this.selectedId = id;
    this.router.navigate( ['/form', id] );
  }

  refresh() {
    this.nodes = [];
    this.tree.treeModel.expandedNodeIds = {};
    this.tree.treeModel.expandedNodes = [];
    this.tree.treeModel.activeNodeIds = {};
    this.tree.treeModel.activeNodes = [];
    this.query(null);
  }

}