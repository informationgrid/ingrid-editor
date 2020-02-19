import {Injectable} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {UpdateDatasetInfo} from '../../../models/update-dataset-info.model';
import {DocumentService} from '../../../services/document/document.service';
import {TreeQuery} from '../../../store/tree/tree.query';
import {DocumentAbstract} from '../../../store/document/document.model';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable()
export class DynamicDatabase {

  treeUpdates = new Subject<UpdateDatasetInfo>();

  constructor(private docService: DocumentService, private treeQuery: TreeQuery, private addressTreeQuery: AddressTreeQuery) {
    this.docService.datasetsChanged$.subscribe(docs => this.treeUpdates.next(docs));
  }

  /** Initial data from database */
  initialData(forceFromServer?: boolean, isAddress?: boolean): Observable<DocumentAbstract[]> {
    return this.getChildren(null, forceFromServer, isAddress);
  }

  getChildren(node: string, forceFromServer?: boolean, isAddress?: boolean): Observable<DocumentAbstract[]> {

    let children;
    if (forceFromServer) {
      children = [];
    } else {
      if (isAddress) {
        children = this.addressTreeQuery.getChildren(node);
      } else {
        children = this.treeQuery.getChildren(node);
      }
    }

    if (children.length > 0) {
      return of(children);
    }
    return this.docService.getChildren(node, isAddress);
  }

  search(value: string) {
    return this.docService.find(value);
  }

  getPath(id: string): Promise<string[]> {
    return this.docService.getPath(id).toPromise();
  }

  static mapDocumentsToTreeNodes(docs: DocumentAbstract[], level: number) {
    return docs.map(doc => new TreeNode(
      doc.id.toString(), doc.title, doc._profile, doc._state, level, doc._hasChildren, doc._parent, doc.icon)
    );
  }
}
