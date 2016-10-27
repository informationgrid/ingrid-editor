import {Component, OnInit, ViewChild} from '@angular/core';
import {StorageService} from "../../../services/storage/storage.service";
import {TreeComponent, TreeNode} from "angular2-tree-component";
import {Router, ActivatedRoute} from "@angular/router";
import {FormularService} from "../../../services/formular/formular.service";

@Component({
  selector: 'tree',
  template: require('./tree.component.html')
})
export class MetadataTreeComponent implements OnInit {

  @ViewChild(TreeComponent) private tree: TreeComponent;

  nodes: any[] = [];
  selectedId: string = '';

  options = {
    getChildren: (node: TreeNode) => {
      console.log( 'get children ...', node.id );
      this.query(node.id);
    }
  };

  constructor(private storageService: StorageService, private router: Router, private route: ActivatedRoute,
              private formularService: FormularService) {
    storageService.datasetsChanged.asObservable().subscribe( () => {
      this.nodes = [];
      this.query(null);
    } );
  }

  ngOnInit() {
    this.query(null).then( () => {
      this.route.params.subscribe(params => {
        this.selectedId = params['id'];
        console.debug( 'selected id: ' + this.selectedId );
        if (this.selectedId) {
          let node = this.tree.treeModel.getNodeById(this.selectedId);
          this.tree.treeModel.setActiveNode(node, true);
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
    let updatedNodes = this.nodes;
    if (parentId) {
      updatedNodes = this.nodes.filter( node => node.id === parentId)[0];
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

}