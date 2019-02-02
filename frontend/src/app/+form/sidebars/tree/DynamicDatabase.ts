import {Injectable} from '@angular/core';
import {FormularService} from "../../../services/formular/formular.service";
import {ProfileQuery} from "../../../store/profile/profile.query";
import {DocumentQuery} from "../../../store/document/document.query";
import {ProfileService} from "../../../services/profile.service";
import {DocumentService} from "../../../services/document/document.service";
import {TreeNode} from "../../../store/tree/tree-node.model";
import {DocumentAbstract} from "../../../store/document/document.model";
import {Observable, of} from "rxjs";
import {TreeQuery} from "../../../store/tree/tree.query";

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable()
export class DynamicDatabase {
  dataMap = {};

  constructor(private storageService: DocumentService, private profileService: ProfileService,
              private treeQuery: TreeQuery, private profileQuery: ProfileQuery,
              private formularService: FormularService) {

    treeQuery.selectAll().subscribe( docs => {
      docs.map( doc => this.mapToTreeNode(doc));
    });

  }

  initialData(): Promise<TreeNode[]> {
    this.profileQuery.isInitialized$.subscribe(() => {

    });
    return this.profileService.initialized.then( () => {

      return this.query( null, 0 );
    } );
  }

  mapToTreeNode(doc: DocumentAbstract, level: number): TreeNode {
    return <TreeNode>{
      _id: doc._id,
      title: doc.title ? doc.title : 'Kein Titel',
      state: doc._state,
      hasChildren: doc._hasChildren,
      level: level
    };
  }

  query(id: string, level: number): Promise<TreeNode[]> {
    return new Promise( (resolve, reject) => {
      this.storageService.getChildren( id ).subscribe(response => {
        console.log( 'got children', response );
        const nodes = [];
        response.forEach( child => nodes.push(this.mapToTreeNode( child, level )));

        resolve( nodes );
      }, error => {
        reject(error);
      } );
    } );
  }

  private getTreeIcon(doc: TreeNode): string {
    const classType = this.formularService.getIconClass( doc.profile );
    const classState = doc.state === 'P'
      ? 'published-label'
      : doc.state === 'W'
        ? 'working-label'
        : 'published-working-label';

    return classType + ' ' + classState;
  }


  getChildren(nodeId: string, level: number): Promise<TreeNode[]> {
    if (this.dataMap[nodeId]) {
      return of(this.dataMap[nodeId]).toPromise();
    }

    return this.query( nodeId, level )
      .then( data => this.dataMap[nodeId] = data);
  }

  isExpandable(node: TreeNode): boolean {
    return node.hasChildren;
  }
}
