import { ProfileService } from '../../../services/profile.service';
import { StorageService } from '../../../services/storage/storage.service';
import { FormularService } from '../../../services/formular/formular.service';
import { Injectable } from '@angular/core';
import { DynamicFlatNode } from './DynamicFlatNode';

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable()
export class DynamicDatabase {
  dataMap = null;

  rootLevelNodes = null;

  constructor(private storageService: StorageService, private profileService: ProfileService,
              private formularService: FormularService) {
  }

  /** Initial data from database */
  initialData(): Promise<DynamicFlatNode[]> {
    return this.profileService.initialized.then( () => {

      return this.query( null ).then( (data) => {
        return data.map( item => new DynamicFlatNode( item._id + '', item.title, item._profile, item._state, 0, item._hasChildren, item.icon ) );
      } );
    } );
  }

  query(id: string): Promise<any> {
    return new Promise( (resolve, reject) => {
      this.storageService.getChildDocuments( id ).subscribe( response => {
        console.log( 'got children', response );
        const nodes = this.prepareNodes( response );
        resolve( nodes );
      }, error => {
        reject(error);
      } );
    } );
  }

  prepareNodes(docs: any[]): any[] {
    // const updatedNodes: any = parentNode ? parentNode : this.nodes;

    const modDocs = docs
      .filter( doc => doc !== null && doc._profile !== undefined )
      .sort( (doc1, doc2) => { // TODO: sort after conversion, then we don't need to call getTitle function
        return this.formularService.getTitle( doc1._profile, doc1 ).localeCompare( this.formularService.getTitle( doc2._profile, doc2 ) );
      } );
    modDocs.forEach( doc => {
      doc.title = this.formularService.getTitle( doc._profile, doc );
      doc.icon = this.getTreeIcon( doc );
      //   const newNode = this.prepareNode( doc );
      //   if (parentNode) {
      //     updatedNodes.children.push( newNode );
      //   } else {
      //     updatedNodes.push( newNode );
      //   }
      //   this.flatNodes.push( newNode );
    } );
    return modDocs;
    // this.tree.treeModel.update();
  }

  private getTreeIcon(doc): string {
    const classType = this.formularService.getIconClass( doc._profile );
    const classState = doc._state === 'P'
      ? 'published-label'
      : doc._state === 'W'
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
