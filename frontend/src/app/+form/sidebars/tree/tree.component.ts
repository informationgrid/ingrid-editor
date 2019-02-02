import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material";
import {TreeNode} from "../../../store/tree/tree-node.model";
import {DocumentAbstract} from "../../../store/document/document.model";
import {DocumentService} from "../../../services/document/document.service";
import {Observable} from "rxjs";
import {TreeQuery} from "../../../store/tree/tree.query";
import {TreeStore} from "../../../store/tree/tree.store";
import {DynamicDataSource} from "./DynamicDataSource";
import {DynamicDatabase} from "./DynamicDatabase";


@Component({
  selector: 'ige-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
  providers: [DynamicDatabase]
})
export class MetadataTreeComponent {

  @Input() showFolderEditButton = true;
  @Output() selected = new EventEmitter<DocumentAbstract[]>();
  @Output() activate = new EventEmitter<DocumentAbstract[]>();


  private transformer = (node: DocumentAbstract, level: number) => {
    return <TreeNode>{
      hasChildren: node._hasChildren,
      title: node.title ? node.title : 'kein Titel',
      level: level,
      _id: node._id
    };
  };

  treeControl = new FlatTreeControl<TreeNode>(
    node => node.level,
    node => node.hasChildren);

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.hasChildren,
    node => this.getChildren(node)
  );

  dataSource: DynamicDataSource;

  constructor(database: DynamicDatabase, private documentService: DocumentService, private treeQuery: TreeQuery, private treeStore: TreeStore) {
    // @ts-ignore
    /*this.getChildren({_id: null}).subscribe( children => {
      this.dataSource.data = children;
      return children;
    });*/

    this.treeControl = new FlatTreeControl<TreeNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);

    database.initialData().then( data => this.dataSource.data = data);
  }

  getLevel = (node: TreeNode) => node.level;

  isExpandable = (node: TreeNode) => node.hasChildren;

  hasChild = (_: number, node: TreeNode) => {
    return node.hasChildren;
  };

  private getChildren(node: DocumentAbstract): Observable<DocumentAbstract[]> {
    return this.documentService.getChildren(node._id);

  }

  selectNode(node: TreeNode) {
    // deselect all nodes first
    this.treeControl.dataNodes.forEach(node => node.isSelected = false);

    // set selection state to new node
    node.isSelected = true;

    const selectedData: DocumentAbstract = this.treeQuery.getSnapshot().entities[node._id];
    this.treeStore.setOpenedDocument(selectedData);
    this.treeStore.setSelected([selectedData]);
    this.selected.next([selectedData]);
  }
}
