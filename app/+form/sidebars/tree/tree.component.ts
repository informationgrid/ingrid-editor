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
          let newDataset = {
            id: -1,
            name: 'Neuer Datensatz',
            _profile: info.data._profile,
            _state: 'W'
          };

          let updateTree = () => {
            this.tree.treeModel.update();
            this.router.navigate(['/form', '-1']);
            let node = this.tree.treeModel.getNodeById(-1);
            this.tree.treeModel.setActiveNode(node, true);
          };

          debugger;
          if (info.data._parent) {
            let parentNode = this.tree.treeModel.getNodeById(info.data._parent);
            // TODO: make it bullet proof
            parentNode.expand();
            setTimeout(() => {
              let path = this.getNodeIdPath(info.data._parent);
              let pNode = this.getNodeFromModel(path);

              // let pNode = this.nodes.filter( node => node.id === info.data._parent)[0];
              if (!pNode.children) pNode.children = [];
              pNode.children.push( newDataset );
              updateTree();
            }, 100);
          } else {
            this.nodes.push( newDataset );
            updateTree();
          }

          break;

        case UpdateType.Update:
          debugger;
          /*
          let indexUpdateNode = nodeParentUpdate.children.findIndex((c: any) => c.id === info.data._id);
          let updateNode = this.prepareNode(info.data);
          nodeParentUpdate.children[indexUpdateNode] = updateNode;
          this.tree.treeModel.update();*/

          let pathUpdate = this.getNodeIdPath(info.data._id);
          let nodeParentUpdate = this.getNodeFromModel(pathUpdate);
          // nodeParentUpdate._state = info.data._state;
          Object.assign(nodeParentUpdate, this.prepareNode(info.data));

          // this.nodes = [];
          // this.query(info.data._parent);
          break;
        case UpdateType.Delete:
          let path = this.getNodeIdPath(info.data._parent);
          let nodeParent = this.getNodeFromModel(path);

          // this.nodes = this.nodes.filter( node => node.id !== info.data._id);
          let index = nodeParent.children.findIndex( (c: any) => c.id === info.data._id );
          nodeParent.children.splice(index, 1);
          this.tree.treeModel.update();
      }

    } );
  }

  getNodeIdPath(id: string): string[] {
    let path: string[] = null;
    if (id) {
      let parentNode = this.tree.treeModel.getNodeById(id);
      path = parentNode.path;
    }
    return path;
  }

  getNodeFromModel(path: string[]): any {
    let nodeParent: any = null;
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
            debugger;
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
      _state: doc._state,
      // children: [],
      _id: doc._id
    };
    if (doc.hasChildren) {
      node.hasChildren = true;
    }

    return node;
  }

  setNodes(docs: any[], parentId: string) {
    let updatedNodes: any = this.nodes;
    if (parentId) {
      debugger;
      let path = this.getNodeIdPath(parentId);
      updatedNodes = this.getNodeFromModel(path);
      // updatedNodes = this.nodes.filter( node => node.id === parentId)[0];
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

  /*showTitle(entry: any): string {
    if (entry.title) {
      return entry.title;
    } else if (entry['mainInfo.title']) {
      return entry['mainInfo.title'];
    } else {
      return '- untitled -';
    }
  }*/

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