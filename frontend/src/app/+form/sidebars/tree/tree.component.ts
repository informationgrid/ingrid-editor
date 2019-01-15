import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormularService} from '../../../services/formular/formular.service';
import {Subscription} from 'rxjs';
import {NestedTreeControl} from '@angular/cdk/tree';
import {ConfigService} from "../../../services/config/config.service";
import {MatTreeNestedDataSource} from "@angular/material";
import {DocumentDatabase} from "./document-database";
import {TreeNode} from "../../../store/tree/tree-node.model";
import {TreeQuery} from "../../../store/tree/tree.query";
import {DocumentAbstract} from "../../../store/document/document.model";
import {DocumentQuery} from "../../../store/document/document.query";

@Component({
  selector: 'ige-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
  providers: [DocumentDatabase]
})
export class MetadataTreeComponent implements OnInit, OnDestroy {

  selectedNodes: TreeNode[] = [];


  @Input() showFolderEditButton = true;
  @Output() selected = new EventEmitter<DocumentAbstract[]>();
  @Output() activate = new EventEmitter<DocumentAbstract[]>();

  subscriptions: Subscription[] = [];

  copiedNodes: any[] = [];
  cutNodes: any[] = [];

  treeControl: NestedTreeControl<TreeNode>;

  dataSource: MatTreeNestedDataSource<TreeNode>;
  constructor(private database: DocumentDatabase, private storageService: DocumentService, private router: Router,
              private treeQuery: TreeQuery,
              private documentQuery: DocumentQuery,

              private route: ActivatedRoute, private formularService: FormularService, private configService: ConfigService) {

    //this.dataSource.data = null;
    this.treeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.dataSource = new MatTreeNestedDataSource<TreeNode>();

    this.treeQuery.selectAll().subscribe( nodes => {
      console.log('Received updated nodes');
      this.treeControl.expansionModel.select(...this.treeQuery.openedTreeNodes);
      // only root nodes since children will be resolved later
      this.dataSource.data = nodes.filter(d => !d.parent);
    });

  }

  private _getChildren = (node: TreeNode) => {
    let children = this.treeQuery.getAll({filterBy: entity => entity.parent === node.id});
    return children;
  };

  hasNestedChild = (_: number, nodeData: TreeNode) => nodeData.hasChildren === true;

  fetchChildren(id: string) {
    this.database.getChildren(id);
  }

  ngOnInit() {
    this.database.getChildren(null);
    /*this.profileService.initialized.then( () => {

      this.query( null, null ).then( () => {
      }, (err) => console.error( 'Error:', err ) );
*/
    /*
    this.configService.promiseProfilePackageLoaded.then(() => {

      this.database.initialData();
      let initialSubscriber = this.database.nodes$.asObservable().subscribe( nodes => {
          // get route parameter and expand to defined node
          const initialSet = this.route.params.subscribe(params => {
            const selectedId = params['id'];

            // only let this function be called once, since we only need it during first visit of the page
            setTimeout(() => {
                initialSet.unsubscribe();
                initialSubscriber.unsubscribe();
              }, 0);

            if (selectedId) {
              // get path to node
              this.subscriptions.push(this.storageService.getPath(selectedId).subscribe(path => {
                console.log('path: ' + path);
                this.expandToPath(path.reverse())
                  .then(() => {
                    this.open(this.selectedNodes[0]);
                  });
              }));
            }
          });
        });
    });

    this.subscriptions.push(
      this.storageService.datasetsChanged$.subscribe((info) => {
        console.log('Tree: dataset changed event', info);
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
            // this.copy();
            break;
          case UpdateType.Paste:
            // this.paste();
            break;
        }
      })
    );*/
    /*
          // inform interested components which documents are selected
          // this.formularService.selectedDocuments$.subscribe( (ids) => {
          //   ids.push(this.selectedId);
          // });

          // this.handleToolbarEvents();
        } );*/
  }

  refresh() {
    this.database.getChildren(null);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(_ => _.unsubscribe());
  }

  open(node: TreeNode) {
    this.selectedNodes = [node];
    const data = this.getSelectedNodes(this.selectedNodes);


    this.activate.next(data);
    this.selected.next(data);
  }

  private getSelectedNodes(nodes: TreeNode[]): DocumentAbstract[] {
    return nodes.map(node => this.documentQuery.getEntity(node.id));
  }
}
