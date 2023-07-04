import { Injectable } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { UpdateDatasetInfo } from "../../../models/update-dataset-info.model";
import { DocumentService } from "../../../services/document/document.service";
import { TreeQuery } from "../../../store/tree/tree.query";
import { DocumentAbstract } from "../../../store/document/document.model";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { map } from "rxjs/operators";

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@UntilDestroy()
@Injectable()
export class DynamicDatabase {
  treeUpdates = new Subject<UpdateDatasetInfo>();

  hideReadOnly = false;

  constructor(
    private docService: DocumentService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery
  ) {}

  init(forAdresses: boolean): void {
    const query = forAdresses ? this.addressTreeQuery : this.treeQuery;
    query.datasetsChanged$
      .pipe(untilDestroyed(this))
      .subscribe((docs) => this.treeUpdates.next(docs));
  }

  /** Initial data from database */
  initialData(
    forceFromServer?: boolean,
    isAddress?: boolean
  ): Observable<DocumentAbstract[]> {
    const children = this.getChildren(null, forceFromServer, isAddress);
    if (this.hideReadOnly) {
      return children.pipe(
        map((docs) =>
          docs.filter(
            (doc) => doc.hasWritePermission || doc.hasOnlySubtreeWritePermission
          )
        )
      );
    } else {
      return children;
    }
  }

  getChildren(
    parentId: number,
    forceFromServer?: boolean,
    isAddress?: boolean
  ): Observable<DocumentAbstract[]> {
    let children;
    if (forceFromServer) {
      children = [];
    } else {
      const query = isAddress ? this.addressTreeQuery : this.treeQuery;
      children = query.getChildren(parentId);
    }

    if (children.length > 0) {
      return of(children);
    }

    const moreChildren = this.docService.getChildren(parentId, isAddress);
    if (this.hideReadOnly) {
      return moreChildren.pipe(
        map((docs) =>
          docs.filter(
            (doc) => doc.hasWritePermission || doc.hasOnlySubtreeWritePermission
          )
        )
      );
    } else {
      return moreChildren;
    }
  }

  search(value: string, isAddress: boolean) {
    return this.docService.find(value, 10, isAddress);
  }

  getPath(id: number): Promise<number[]> {
    return this.docService
      .getPath(id)
      .pipe(map((paths) => paths.map((path) => path.id)))
      .toPromise();
  }

  mapDocumentsToTreeNodes(docs: DocumentAbstract[], level: number): TreeNode[] {
    return docs.map(
      (doc) =>
        new TreeNode(
          <number>doc.id,
          doc._uuid,
          doc.title,
          doc._type,
          doc._state,
          level,
          doc._hasChildren,
          doc._parent,
          doc.icon,
          false,
          doc.hasWritePermission,
          doc.hasOnlySubtreeWritePermission,
          doc._tags
        )
    );
  }
}
