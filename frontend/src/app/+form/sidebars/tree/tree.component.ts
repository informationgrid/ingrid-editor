import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {TreeNode} from "../../../store/tree/tree-node.model";
import {DocumentAbstract} from "../../../store/document/document.model";
import {DocumentService} from "../../../services/document/document.service";
import {Observable} from "rxjs";
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
  @Output() selected = new EventEmitter<string[]>();
  @Output() activate = new EventEmitter<DocumentAbstract[]>();

  treeControl = new FlatTreeControl<TreeNode>(
    node => node.level,
    node => node.hasChildren);

  dataSource: DynamicDataSource;

  constructor(database: DynamicDatabase, private documentService: DocumentService) {

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

    this.selected.next([node._id]);
  }
}
