/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { effect, inject, Injectable } from "@angular/core";
import { firstValueFrom, Observable, of, Subject } from "rxjs";
import { UpdateDatasetInfo } from "../../../models/update-dataset-info.model";
import { DocumentService } from "../../../services/document/document.service";
import { DocumentAbstract } from "../../../store/document/document.model";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { UntilDestroy } from "@ngneat/until-destroy";
import { map } from "rxjs/operators";
import { GeneralStore } from "../../../store/general.store";
import { AddressTreeStore } from "../../../store/address-tree/address-tree.store";
import { TreeStore } from "../../../store/tree/tree.store";
import { TreeStoreLongTermFileStorage } from "../../../store/tree/tree.storeLongTermFileStorage";

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@UntilDestroy()
@Injectable()
export class DynamicDatabase {
  private generalStore = inject(GeneralStore);
  private addressTreeStore = inject(AddressTreeStore);
  private documentTreeStore = inject(TreeStore);
  private longTermFileStorageTreeStore = inject(TreeStoreLongTermFileStorage);
  private isLongTermStorage = false;

  treeUpdates = new Subject<UpdateDatasetInfo>();

  hideReadOnly = false;

  private isAddress = false;

  constructor(private docService: DocumentService) {
    effect(() => {
      const info = this.generalStore.getDatasetsChanged(this.isAddress);
      if (info) this.treeUpdates.next(info);
    });
  }

  init(forAdresses: boolean, isLongTermStorage: boolean): void {
    this.isAddress = forAdresses;
    this.isLongTermStorage = isLongTermStorage;
  }

  /** Initial data from database */
  initialData(
    forceFromServer?: boolean,
    isAddress?: boolean,
  ): Observable<DocumentAbstract[]> {
    const children = this.getChildren(null, forceFromServer, isAddress);
    if (this.hideReadOnly) {
      return children.pipe(
        map((docs) =>
          docs.filter(
            (doc) =>
              doc.hasWritePermission || doc.hasOnlySubtreeWritePermission,
          ),
        ),
      );
    } else {
      return children;
    }
  }

  getChildren(
    parentId: number,
    forceFromServer?: boolean,
    isAddress?: boolean,
  ): Observable<DocumentAbstract[]> {
    let children: DocumentAbstract[];
    if (forceFromServer) {
      children = [];
    } else {
      const query = isAddress
        ? this.addressTreeStore
        : this.isLongTermStorage
          ? this.longTermFileStorageTreeStore
          : this.documentTreeStore;
      children = query.getChildren(parentId);
    }

    if (children.length > 0) {
      return of(children);
    }

    const moreChildren = this.docService.getChildren(
      parentId,
      isAddress,
      this.isLongTermStorage,
    );
    if (this.hideReadOnly) {
      return moreChildren.pipe(
        map((docs) =>
          docs.filter(
            (doc) =>
              doc.hasWritePermission || doc.hasOnlySubtreeWritePermission,
          ),
        ),
      );
    } else {
      return moreChildren;
    }
  }

  search(value: string, isAddress: boolean) {
    return this.docService.findInTitleOrUuid(value, 20, isAddress);
  }

  getPath(id: number): Promise<number[]> {
    return firstValueFrom(
      this.docService
        .getPath(id)
        .pipe(map((paths) => paths.map((path) => path.id))),
    );
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
          doc._tags,
        ),
    );
  }
}
