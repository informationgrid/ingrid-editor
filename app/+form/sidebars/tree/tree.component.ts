import {Component, OnInit, ViewChild} from '@angular/core';
import {StorageService} from '../../../services/storage/storage.service';
import {TreeComponent, TreeNode} from 'angular2-tree-component';
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
      console.log( 'get children ...', node.id );
      return this.query(node.id);
    }
  };

  constructor(private storageService: StorageService, private router: Router, private route: ActivatedRoute,
              private formularService: FormularService) {
    storageService.datasetsChanged$.subscribe( (info) => {
      console.log( 'info', info );
      // TODO: only update changes or recover last state when loading everything new
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
      this.router.navigate(['/form', '-1']);
      let node = this.tree.treeModel.getNodeById(-1);
      this.tree.treeModel.setActiveNode(node, true);
    };

    debugger;
    if (doc._parent) {
      let parentNode = this.tree.treeModel.getNodeById(doc._parent);
      // TODO: make it bullet proof by expecting a promise from expand
      parentNode.expand();
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
      id: -1,
      name: 'Neuer Datensatz',
      _profile: doc._profile,
      _state: 'W'
    };
  }

  onUpdateDataset(doc: any) {
    let nodeParentUpdate = this.getNodeFromModel(doc._id);
    Object.assign(nodeParentUpdate, this.prepareNode(doc));
  }

  onDeleteDataset(doc: any) {
    let nodeParent = this.getNodeFromModel(doc._parent);

    // this.nodes = this.nodes.filter( node => node.id !== doc._id);
    let index = nodeParent.children.findIndex( (c: any) => c.id === doc._id );
    nodeParent.children.splice(index, 1);
    this.tree.treeModel.update();
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

  ngOnInit() {
    this.query(null).then( () => {
      this.route.params.subscribe(params => {
        this.selectedId = params['id'];

        if (this.selectedId && this.selectedId !== '-1') {
          // get path to node
          this.storageService.getPathToDataset( this.selectedId ).subscribe( path => {
            console.debug( 'path: ' + path );
            let timeout = 0;

            path.forEach( (id, index) => {
              setTimeout( () => {
                let node = this.tree.treeModel.getNodeById( id );
                let isLast = index === (path.length - 1);

                // focus selected node if the last one was expanded
                if (isLast) {
                  setTimeout( () => this.tree.treeModel.setActiveNode( node, true ), 100 );
                } else {
                  // expand node
                  node.expand();
                }
              }, timeout );
              timeout += 500;
            } );
          } );
        }
      });
    });
  }

  query(id: string): Promise<any> {
    return new Promise(resolve => {
      this.storageService.getChildDocuments(id).subscribe(response => {
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
      // children: [],
      // _id: doc._id
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
    console.log('nodes: ', this.nodes);
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