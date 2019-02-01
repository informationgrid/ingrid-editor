import {ProfileService} from '../../../services/profile.service';
import {DocumentService} from '../../../services/document/document.service';
import {FormularService} from '../../../services/formular/formular.service';
import {Injectable} from '@angular/core';
import {DynamicFlatNode} from './DynamicFlatNode';
import {DocumentQuery} from "../../../store/document/document.query";
import {ProfileQuery} from "../../../store/profile/profile.query";
import {TreeNode} from "../../../store/tree/tree-node.model";

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicDatabase {
  dataMap = null;

  rootLevelNodes = null;

  constructor(private storageService: DocumentService, private profileService: ProfileService,
              private docQuery: DocumentQuery, private profileQuery: ProfileQuery,
              private formularService: FormularService) {
  }

  /** Initial data from database */
  initialData(): Promise<DynamicFlatNode[]> {
    this.profileQuery.isInitialized$.subscribe(() => {

    });
    return this.profileService.initialized.then( () => {

      return this.query( null ).then( (data) => {
        return data.map( item => new DynamicFlatNode( item.id + '', item.title, item.profile, item.state, 0, item._hasChildren, item.icon ) );
      } );
    } );
  }

  query(id: string): Promise<any> {
    return new Promise( (resolve, reject) => {
      this.storageService.getChildren( id ).subscribe(response => {
        console.log( 'got children', response );
        const nodes = this.prepareNodes( response );
        resolve( nodes );
      }, error => {
        reject(error);
      } );
    } );
  }

  prepareNodes(docs: TreeNode[]): any[] {
    // const updatedNodes: any = parentNode ? parentNode : this.nodes;

    const modDocs = docs
      .filter( doc => doc !== null && doc.profile !== undefined )
      .sort( (doc1, doc2) => { // TODO: sort after conversion, then we don't need to call getTitle function
        return this.formularService.getTitle( doc1.profile, doc1 ).localeCompare( this.formularService.getTitle( doc2.profile, doc2 ) );
      } );

    let newDocs = modDocs.map( doc => {
      // let newDoc = this.docQuery.getEntity(doc._id);
      let newDoc = Object.assign({}, doc);
      newDoc.title = this.formularService.getTitle( doc.profile, doc );
      newDoc.iconClass = this.getTreeIcon( doc );
      return newDoc;
      //   const newNode = this.prepareNode( doc );
      //   if (parentNode) {
      //     updatedNodes.children.push( newNode );
      //   } else {
      //     updatedNodes.push( newNode );
      //   }
      //   this.flatNodes.push( newNode );
    } );
    return newDocs;
    // this.tree.treeModel.update();
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


  getChildren(nodeId: string): Promise<any[]> | undefined {
    return this.query( nodeId );
  }

  isExpandable(node: any): boolean {
    return node._hasChildren;
  }
}
