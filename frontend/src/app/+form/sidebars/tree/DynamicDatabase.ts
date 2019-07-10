import {Injectable} from '@angular/core';
import {DocumentService} from "../../../services/document/document.service";
import {TreeNode} from "../../../store/tree/tree-node.model";
import {DocumentAbstract} from "../../../store/document/document.model";
import {Observable, of} from "rxjs";
import {tap} from "rxjs/operators";

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable()
export class DynamicDatabase {
  dataMap = {};

  constructor(private storageService: DocumentService) {
  }

  getChildren(nodeId: string, level: number): Observable<TreeNode[]> {

    if (this.dataMap[nodeId]) {
      return of(this.dataMap[nodeId]);
    }

    return this.query(nodeId, level);

  }


  static mapToTreeNode(doc: DocumentAbstract, level: number): TreeNode {

    return <TreeNode>{
      _id: doc.id,
      title: doc.title ? doc.title : 'Kein Titel',
      state: doc._state,
      hasChildren: doc._hasChildren,
      level: level
    };

  }

  private query(id: string, level: number): Observable<any> {

    return this.storageService.getChildren(id)
      .pipe(
        tap((response) => {
          console.log('got children', response);
          const nodes = [];
          response.forEach(child => nodes.push(DynamicDatabase.mapToTreeNode(child, level)));

          this.dataMap[id] = nodes;
          return nodes;
        })
      );

  }

  /*private getTreeIcon(doc: TreeNode): string {
    const classType = this.formularService.getIconClass( doc.profile );
    const classState = doc.state === 'P'
      ? 'published-label'
      : doc.state === 'W'
        ? 'working-label'
        : 'published-working-label';

    return classType + ' ' + classState;
  }*/
}
