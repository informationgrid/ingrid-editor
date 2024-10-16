/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { Injectable } from "@angular/core";
import { ModalService } from "../modal/modal.service";
import { UpdateType } from "../../models/update-type.enum";
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  Subject,
  Subscription,
} from "rxjs";
import {
  catchError,
  filter,
  finalize,
  map,
  switchMap,
  tap,
} from "rxjs/operators";
import { DocumentWithMetadata, IgeDocument } from "../../models/ige-document";
import { DocumentDataService } from "./document-data.service";
import { DocumentAbstract } from "../../store/document/document.model";
import { TreeStore } from "../../store/tree/tree.store";
import { applyTransaction, HashMap, transaction } from "@datorama/akita";
import { FormMessageService } from "../form-message.service";
import { ProfileService } from "../profile.service";
import { SessionStore } from "../../store/session.store";
import { HttpClient } from "@angular/common/http";
import { ConfigService, Configuration } from "../config/config.service";
import { SearchResult } from "../../models/search-result.model";
import { ServerSearchResult } from "../../models/server-search-result.model";
import { AddressTreeStore } from "../../store/address-tree/address-tree.store";
import { StatisticResponse } from "../../models/statistic.model";
import { SessionQuery } from "../../store/session.query";
import { PathResponse } from "../../models/path-response";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import {
  ResearchResponse,
  ResearchService,
} from "../../+research/research.service";
import { DocEventsService } from "../event/doc-events.service";
import { TranslocoService } from "@ngneat/transloco";
import { TagRequest } from "../../models/tag-request.model";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CatalogService } from "../../+catalog/services/catalog.service";
import { isExpired } from "../utils";

export type AddressTitleFn = (address: IgeDocument) => string;

export interface ReloadData {
  uuid: string;
  forAddress: boolean;
}

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  // TODO: check usefulness
  documentOperationFinished$ = new Subject<any>();
  publishState$ = new BehaviorSubject<boolean>(false);
  reload$ = new Subject<ReloadData>();

  private configuration: Configuration;
  private alternateAddressTitle: (IgeDocument) => string = null;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private modalService: ModalService,
    private dataService: DocumentDataService,
    private catalogService: CatalogService,
    private messageService: FormMessageService,
    private profileService: ProfileService,
    private sessionStore: SessionStore,
    private sessionQuery: SessionQuery,
    private treeStore: TreeStore,
    private addressTreeStore: AddressTreeStore,
    private researchService: ResearchService,
    private translocoService: TranslocoService,
    private docEvents: DocEventsService,
    private snackBar: MatSnackBar,
  ) {
    this.configuration = configService.getConfiguration();
  }

  findInTitleOrUuid(
    query: string,
    size = 10,
    address = false,
    excludeFolders = false,
  ): Observable<SearchResult> {
    const categorySQL = ` AND document_wrapper.category = ${
      address ? "'address'" : "'data'"
    }`;
    const excludeFoldersSQL = excludeFolders
      ? " AND document1.type != 'FOLDER'"
      : "";
    return this.researchService
      .searchBySQL(
        `SELECT DISTINCT document1.*, document_wrapper.category
         FROM document_wrapper
                JOIN document document1 ON document_wrapper.uuid = document1.uuid
         WHERE (title ILIKE '%${query}%' OR document1.uuid = '${query}')
           ${categorySQL} ${excludeFoldersSQL}`,
        1,
        size,
      )
      .pipe(map((result) => this.mapSearchResults(result)));
  }

  findRecentDrafts(fromCurrentUser: boolean = false): void {
    let currentUser = this.getCurrentUserQuery(fromCurrentUser);
    this.researchService
      .search(
        "",
        {
          type: "selectDocuments",
          ignoreFolders: "exceptFolders",
          selectConditions: "document1.state IS NOT NULL " + currentUser,
        },
        "modified",
        "DESC",
        {
          page: 1,
          pageSize: 10,
        },
        ["selectConditions"],
      )
      .pipe(
        map((result) => this.mapSearchResults(result)),
        tap((docs) => this.sessionStore.update({ latestDocuments: docs.hits })),
      )
      .subscribe();
  }

  findRecentPublished(fromCurrentUser: boolean = false): void {
    // only published
    this.researchService
      .search(
        "",
        {
          type: "selectDocuments",
          ignoreFolders: "exceptFolders",
          selectConditions:
            "document1.state = 'PUBLISHED' " +
            this.getCurrentUserQuery(fromCurrentUser),
        },
        "modified",
        "DESC",
        {
          page: 1,
          pageSize: 10,
        },
        ["selectConditions"],
      )
      .pipe(
        map((result) => this.mapSearchResults(result)),
        tap((docs) =>
          this.sessionStore.update({ latestPublishedDocuments: docs.hits }),
        ),
      )
      .subscribe();
  }

  findExpired(fromCurrentUser: boolean = false): void {
    let currentUser = fromCurrentUser
      ? "and document1.modifiedbyuser = " +
        this.configService.$userInfo.getValue().id
      : "";
    const model = {
      ignoreFolders: "exceptFolders",
      selectConditions: "document1.state = 'PUBLISHED'" + currentUser,
    };
    combineLatest(
      this.catalogService.getExpiryDuration(),
      this.researchService.search(
        "",
        {
          type: "selectDocuments",
          ...model,
        },
        "contentmodified",
        "ASC",
        {
          page: 1,
          pageSize: 5,
        },
        ["selectOnlyPublished"],
      ),
      this.researchService.search(
        "",
        {
          type: "selectAddresses",
          ...model,
        },
        "contentmodified",
        "ASC",
        {
          page: 1,
          pageSize: 5,
        },
        ["selectConditions"],
      ),
    )
      .pipe(
        map(([days, docs, addresses]) => {
          if (days == 0) return [];
          // add annotation to addresses for distinction
          addresses.hits.forEach((hit) => (hit.isAddress = true));
          // combine all hits as observable
          const combined = docs.hits
            .concat(addresses.hits)
            .filter((doc) => isExpired(doc._contentModified, days))
            .sort(
              (a, b) =>
                new Date(a._contentModified).getTime() -
                new Date(b._contentModified).getTime(),
            );
          return this.mapSearchResponseToDocumentAbstracts(combined);
        }),
        tap((docs) =>
          this.sessionStore.update({ oldestExpiredDocuments: docs }),
        ),
      )
      .subscribe();
  }

  findRecentAddresses(): void {
    this.researchService
      .search(
        "",
        { type: "selectAddresses", ignoreFolders: "exceptFolders" },
        "modified",
        "DESC",
        {
          page: 1,
          pageSize: 10,
        },
      )
      .pipe(
        map((result) => this.mapSearchResults(result)),
        tap((docs) => this.sessionStore.update({ latestAddresses: docs.hits })),
      )
      .subscribe();
  }

  getChildren(
    parentId: number,
    isAddress?: boolean,
  ): Observable<DocumentAbstract[]> {
    return this.dataService.getChildren(parentId, isAddress).pipe(
      map((docs) => {
        docs.forEach((doc) => {
          doc.icon = this.profileService.getDocumentIcon(doc._type);
          doc.isRoot = parentId === null;
        });
        return docs as DocumentAbstract[];
      }),
      tap((docs) => this.updateTreeStoreDocs(isAddress, parentId, docs)),
    );
  }

  load(
    id: string | number,
    address?: boolean,
    updateStore = true,
    useUuid = false,
  ): Observable<DocumentWithMetadata> {
    this.documentOperationFinished$.next(false);
    return this.dataService.load(id, useUuid).pipe(
      // map((data) => this.mapDocumentWithMetadata(data)),
      tap((doc) => {
        if (updateStore) {
          this.updateTreeStore(doc, address);
        }
      }),
      tap((doc) =>
        this.docEvents.sendAfterLoadAndSet(doc.documentWithMetadata),
      ),
      finalize(() => this.documentOperationFinished$.next(true)),
    );
  }

  uuidExists(uuid: string): Observable<boolean> {
    return this.dataService.load(uuid, true).pipe(
      catchError(() => of(null)),
      map((result) => result !== null),
    );
  }

  updateOpenedDocumentInTreestore(
    doc: DocumentAbstract,
    address: boolean,
    keepOpenedDocument = false,
  ) {
    const store = address ? this.addressTreeStore : this.treeStore;

    applyTransaction(() => {
      setTimeout(() => store.setActive(doc ? [doc.id] : []), 0);
      if (!keepOpenedDocument) {
        return store.update({
          openedDocument: doc,
        });
      }
    });
  }

  save(saveOptions: SaveOptions): Observable<DocumentWithMetadata> {
    const doc = this.preSaveActions(
      saveOptions.data,
      saveOptions.type,
      saveOptions.isAddress,
    );

    return this.dataService.save(doc, saveOptions).pipe(
      tap(() => {
        if (!saveOptions.noVisualUpdates) {
          this.messageService.sendInfo("Ihre Eingabe wurde gespeichert");
        }
      }),
      tap((json) => {
        const postSaveOptions: PostSaveOptions = {
          ...saveOptions,
          dataWithMetadata: json,
        };
        this.postSaveActions(postSaveOptions);
      }),
      finalize(() => this.documentOperationFinished$.next(true)),
    );
  }

  updateTags(id: number, data: TagRequest, forAddress: boolean) {
    const store = forAddress ? this.addressTreeStore : this.treeStore;

    return this.dataService.updateTags(id, data).pipe(
      tap((newTags: string[]) => {
        store.update(id, {
          _tags: newTags?.join(","),
        });
        const info = store.getValue().entities[id];
        store.update({
          datasetsChanged: {
            type: UpdateType.Update,
            data: [info],
          },
        });
      }),
    );
  }

  private preSaveActions(
    data: IgeDocument,
    docType: string,
    isAddress: boolean,
  ): IgeDocument {
    if (isAddress && docType !== "FOLDER") {
      // recreate address title, as it can not be changed manually for addresses
      data.title = this.createAddressTitle(data);
    }

    this.docEvents.sendBeforeSave();
    this.documentOperationFinished$.next(false);

    return this.trimObjectAndRemoveEvilTags(data);
  }

  private trimObjectAndRemoveEvilTags(obj: IgeDocument): IgeDocument {
    const trimmed = JSON.stringify(obj, (key, value) => {
      return typeof value === "string"
        ? this.removeEvilTags(value.trim())
        : value;
    });
    return JSON.parse(trimmed);
  }

  private removeEvilTags(val: String) {
    // strip all tags except anchors and simple <b>, <i>, <u>, <p>, <br>, <strong>, <ul>, <ol>, <li> tags
    let processed = val.replace(
      /<(?!a>|a href|\/a>|b>|\/b>|i>|\/i>|u>|\/u>|p>|\/p>|br>|br\/>|br \/>|strong>|\/strong>|ul>|\/ul>|ol>|\/ol>|li>|\/li>)[^>]*>/gi,
      "",
    );
    // strip anchors with javascript
    processed = processed.replace(
      /<a[^>]*?href="javascript[^>]*?>.*?<\/a>/gi,
      "",
    );
    // remove all event handlers
    processed = processed.replace(/ on\w+="[^"]*"/g, "");

    if (processed !== val) {
      this.snackBar.open(
        "Ihre Eingabe wurde gespeichert. Bitte beachten Sie, dass bestimmte HTML-Tags nicht erlaubt sind und daher entfernt wurden.",
        "OK",
        {
          duration: 5000,
        },
      );
    }
    return processed;
  }

  postSaveActions(saveOptions: PostSaveOptions) {
    const store = saveOptions.isAddress
      ? this.addressTreeStore
      : this.treeStore;

    if (!saveOptions.dontUpdateForm) {
      this.dataService.mapDocumentWithMetadata(saveOptions.dataWithMetadata);
      this.docEvents.sendAfterSave(saveOptions.dataWithMetadata);
    }

    const parentId = saveOptions.dataWithMetadata.metadata.parentId;
    const info = this.mapToDocumentAbstracts([saveOptions.dataWithMetadata])[0];
    info.isRoot = saveOptions.dataWithMetadata.metadata.parentId === null;

    // after renaming a folder the folder must still be expandable
    if (!saveOptions.isNewDoc) {
      const entity = store.getValue().entities[info.id];
      if (entity) {
        info._hasChildren = entity._hasChildren;
      }
    }

    this.updateOpenedDocumentInTreestore(info, saveOptions.isAddress);

    // update state by adding node and updating parent info
    store.upsert(info.id, info);
    if (saveOptions.isNewDoc && parentId) {
      store.update(parentId, {
        _hasChildren: true,
      });
    }

    store.update({
      datasetsChanged: {
        type: saveOptions.isNewDoc ? UpdateType.New : UpdateType.Update,
        data: [info],
        parent: parentId,
        path: saveOptions.path,
        doNotSelect: saveOptions.dontUpdateForm,
      },
    });
  }

  // FIXME: this should be added with a plugin
  publish(
    id: number,
    version: number,
    docType: string,
    data: IgeDocument,
    isAddress: boolean,
    publishDate: Date = null,
  ): Observable<any> {
    const doc = this.preSaveActions(data, docType, isAddress);

    return this.dataService.publish(id, version, doc, publishDate).pipe(
      // catchError((error) => this.handlePublishError(error, data, isAddress)),
      filter((response) => response !== null && response !== undefined),
      tap(() => {
        if (!publishDate)
          this.messageService.sendInfo("Das Dokument wurde veröffentlicht.");
      }),
      tap((json) =>
        // @ts-ignore
        this.postSaveActions({
          // data: json.documentWithMetadata,
          dataWithMetadata: json,
          isNewDoc: false,
          isAddress: isAddress,
        }),
      ),
      finalize(() => this.documentOperationFinished$.next(true)),
    );
  }

  unpublish(id: number, forAddress: boolean): Observable<any> {
    const store = forAddress ? this.addressTreeStore : this.treeStore;
    return this.dataService.unpublish(id).pipe(
      map((json) => this.mapToDocumentAbstracts([json])),
      tap((json) =>
        store.update({
          datasetsChanged: { type: UpdateType.Update, data: json },
        }),
      ),
      tap((doc) =>
        this.reload$.next({ uuid: doc[0]._uuid, forAddress: forAddress }),
      ),
      tap((doc) => store.upsert(doc[0].id, doc[0])),
      tap(() =>
        this.messageService.sendInfo(
          "Die Veröffentlichung wurde zurückgezogen.",
        ),
      ),
      catchError((error) => {
        return this.handleUnpublishError(error, id);
      }),
    );
  }

  cancelPendingPublishing(id: number, forAddress: boolean): Observable<any> {
    const store = forAddress ? this.addressTreeStore : this.treeStore;
    return this.dataService.cancelPendingPublishing(id).pipe(
      map((json) => this.mapToDocumentAbstracts([json])),
      tap((json) =>
        store.update({
          datasetsChanged: { type: UpdateType.Update, data: json },
        }),
      ),
      tap((doc) =>
        this.reload$.next({ uuid: doc[0]._uuid, forAddress: forAddress }),
      ),
      tap(() =>
        this.messageService.sendInfo(
          "Die geplante Veröffentlichung wurde abgebrochen.",
        ),
      ),
      catchError((error) => {
        if (error?.error?.errorCode === "POST_SAVE_ERROR") {
          console.error(error?.error?.errorText);
          this.messageService.sendError(
            "Problem beim Abbrechen der geplanten Veröffentlichung: " +
              error?.error?.errorText,
          );
          return this.load(id);
        }
      }),
    );
  }

  delete(ids: number[], isAddress: boolean): Observable<void> {
    const store = isAddress ? this.addressTreeStore : this.treeStore;
    return this.dataService.delete(ids).pipe(
      tap(() => {
        // @ts-ignore
        store.update({
          datasetsChanged: {
            type: UpdateType.Delete,
            data: ids.map((id) => ({ id: id })),
          },
        });
      }),
      tap(() => this.updateStoreAfterDelete(ids, isAddress)),
      catchError((error) => this.handleDeleteError(error)),
    );
  }

  private handleDeleteError(error): Observable<any> {
    const errorCode = error?.error?.errorCode;

    const handled = this.docEvents.sendOnError(errorCode);
    if (handled) return of();

    switch (errorCode) {
      case "IS_REFERENCED_ERROR":
        this.handleIsReferencedError(error);
        break;
    }
    throw error;
  }

  private handleUnpublishError(error, id): Observable<any> {
    const errorCode = error?.error?.errorCode;
    switch (errorCode) {
      case "IS_REFERENCED_ERROR":
        this.handleIsReferencedError(error);
        break;
      case "POST_SAVE_ERROR":
        console.error(error?.error?.errorText);
        this.messageService.sendError(
          "Problem beim Entziehen der Veröffentlichung: " +
            error?.error?.errorText,
        );
        return this.load(id);
    }
    throw error;
  }

  private handleIsReferencedError(error) {
    console.error(error?.error?.errorText);
  }

  revert(id: number, isAddress: boolean): Observable<any> {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    return this.dataService.revert(id).pipe(
      map((json) => this.mapToDocumentAbstracts([json])),
      map((json) => {
        json[0]._hasChildren = store.getValue().entities[id]._hasChildren;
        return json;
      }),
      tap((json) =>
        store.update({
          datasetsChanged: { type: UpdateType.Update, data: json },
        }),
      ),
      tap((doc: DocumentAbstract[]) =>
        this.reload$.next({ uuid: doc[0]._uuid, forAddress: isAddress }),
      ),
    );
  }

  getPath(id: number): Observable<ShortTreeNode[]> {
    if (id === null) return of([]);

    let treeEntities = this.getEntitiesFromStoreContainingId(id);
    const path = this.getPathFromTreeStore(treeEntities, id);

    if (path !== null) {
      return of(path.reverse());
    }

    return this.dataService.getPath(id).pipe(
      catchError((error) => {
        if (error.status === 404) {
          return [];
        } else {
          throw error;
        }
      }),
      map((path) => this.preparePath(path)),
    );
  }

  private getEntitiesFromStoreContainingId(id: number) {
    let treeEntities = this.treeStore.getValue().entities;
    if (!treeEntities[id]) {
      treeEntities = this.addressTreeStore.getValue().entities;
    }
    return treeEntities;
  }

  /**
   * Copy a set of documents under a specified destination document.
   * @param srcIDs contains the IDs of the documents to be copied
   * @param dest is the document, where the other docs to be copied will have as their parent
   * @param includeTree if set to tree then the whole tree is being copied instead of just the selected document
   * @param isAddress
   * @returns {Observable<Response>}
   */
  copy(
    srcIDs: number[],
    dest: number,
    includeTree: boolean,
    isAddress: boolean,
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;
    return this.dataService.copy(srcIDs, dest, includeTree).pipe(
      tap((docs) => {
        this.messageService.sendInfo("Datensatz wurde kopiert");

        // const mappedDocs = docs.map((data) => data.documentWithMetadata);
        const infos = this.mapToDocumentAbstracts(docs);

        this.updateStoreAfterCopy(infos, dest, isAddress);

        store.update({
          datasetsChanged: {
            type: UpdateType.New,
            data: infos,
            parent: dest,
            doNotSelect: true,
            // path: path
          },
        });
      }),
    );
  }

  /**
   * Move a set of documents under a specified destination document.
   * @param srcIDs contains the IDs of the documents to be moved
   * @param dest is the document, where the other docs to be copied will have as their parent
   * @param isAddress
   * @param confirm
   * @returns {Observable<Response>}
   */
  move(
    srcIDs: number[],
    dest: number,
    isAddress: boolean,
    confirm = false,
  ): Observable<any> {
    const moveOperation = () =>
      this.dataService.move(srcIDs, dest).pipe(
        switchMap(() => this.getChildrenIfNotDoneYet(dest, isAddress)),
        tap(() => {
          this.messageService.sendInfo("Datensatz wurde verschoben");

          // update internal store, but we had to make sure that the children of the destination folder
          // were already loaded, otherwise the tree won't know if children have been loaded yet
          this.updateStoreAfterMove(srcIDs, dest, isAddress);

          this.reloadDocumentIfOpenedChanged(isAddress, srcIDs);
        }),
      );

    if (confirm) {
      const store = isAddress ? this.addressTreeStore : this.treeStore;

      let destinationTitle: string;
      if (dest === null) {
        destinationTitle = this.translocoService.translate(
          isAddress ? "menu.address" : "menu.form",
        );
      } else {
        destinationTitle = store.getValue().entities[dest].title;
      }

      return this.modalService
        .confirmWith({
          title: "Verschieben bestätigen",
          message: `Möchten Sie den folgenden Datensatz wirklich nach "${destinationTitle}" verschieben?`,
          list: srcIDs.map((id) => store.getValue().entities[id].title),
          buttons: [
            { text: "Abbrechen" },
            {
              id: "confirm",
              text: "Verschieben",
              emphasize: true,
              alignRight: true,
            },
          ],
        })
        .pipe(
          filter((result) => result),
          tap(() => moveOperation().subscribe()),
        );
    } else {
      return moveOperation();
    }
  }

  createAddressTitle(address: IgeDocument) {
    if (this.alternateAddressTitle) {
      return this.alternateAddressTitle(address);
    } else {
      if (address.firstName && address.lastName) {
        return address.lastName + ", " + address.firstName;
      } else if (address.lastName) {
        return address.lastName;
      } else {
        return address.organization ?? "";
      }
    }
  }

  registerAddressTitleFunction(func: AddressTitleFn) {
    if (func !== null && this.alternateAddressTitle !== null) {
      console.error(
        "There are multiple sort functions registered for the tree. Will ignore others!",
      );
    } else {
      this.alternateAddressTitle = func;
    }
  }

  setDocLoadingState(isLoading: boolean, address: boolean) {
    const store = address ? this.addressTreeStore : this.treeStore;
    store.update({ isDocLoading: isLoading });
  }

  getStatistic(): Observable<StatisticResponse> {
    return this.http.get<StatisticResponse>(
      `${this.configuration.backendUrl}statistic`,
    );
  }

  public addToRecentAddresses(address: DocumentAbstract) {
    const recentAddresses = this.sessionQuery.recentAddresses;

    let addresses = recentAddresses[ConfigService.catalogId]?.slice() ?? [];
    addresses = addresses.filter((addr) => addr.id !== address.id);
    addresses.unshift(address);

    // only store 5 most recent addresses
    if (addresses.length > 5) {
      addresses = addresses.slice(0, 5);
    }

    this.sessionStore.update({
      recentAddresses: {
        ...recentAddresses,
        [ConfigService.catalogId]: addresses,
      },
    });
  }

  public removeFromRecentAddresses(id: string) {
    const recentAddresses = this.sessionQuery.recentAddresses;

    let addresses = recentAddresses[ConfigService.catalogId]?.slice() ?? [];
    addresses = addresses.filter((address) => address.id !== id);

    this.sessionStore.update({
      recentAddresses: {
        ...recentAddresses,
        [ConfigService.catalogId]: addresses,
      },
    });
  }

  updateBreadcrumb(id: number, isAddress = false): Subscription {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    return this.getPath(id)
      .pipe(
        tap((path) =>
          store.update({
            breadcrumb: path,
          }),
        ),
      )
      .subscribe();
  }

  private updateTreeStoreDocs(
    isAddress: boolean,
    parentId: number,
    docs: DocumentAbstract[],
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;
    if (parentId === null) {
      store.set(docs);
    } else {
      store.add(docs);
    }
  }

  clearTreeStores() {
    this.treeStore.reset();
    this.addressTreeStore.reset();
  }

  mapToDocumentAbstracts(docs: DocumentWithMetadata[]): DocumentAbstract[] {
    return docs.map((doc) => {
      return {
        id: doc.metadata.wrapperId ?? null,
        icon: this.profileService.getDocumentIcon(doc.metadata.docType),
        title: doc.document.title || "-Kein Titel-",
        _uuid: doc.metadata.uuid,
        _state: doc.metadata.state,
        _hasChildren: doc.metadata.hasChildren,
        _parent: doc.metadata.parentId ?? null,
        _type: doc.metadata.docType,
        _modified: doc.metadata.modified,
        _contentModified: doc.metadata.contentModified,
        _pendingDate: doc.metadata.pendingDate,
        _tags: doc.metadata.tags,
        hasWritePermission: doc.metadata.hasWritePermission ?? false,
        hasOnlySubtreeWritePermission:
          doc.metadata.hasOnlySubtreeWritePermission ?? false,
        isAddress: doc.document.isAddress,
      };
    });
  }

  mapSearchResponseToDocumentAbstracts(docs: any[]): DocumentAbstract[] {
    return docs.map((doc) => {
      return {
        id: doc._id,
        icon: this.profileService.getDocumentIcon(doc._type),
        title: doc.title || "-Kein Titel-",
        _uuid: doc._uuid,
        _state: doc._state,
        _hasChildren: null,
        _parent: null,
        _type: doc._type,
        _modified: null,
        _contentModified: doc._contentModified,
        _pendingDate: null,
        _tags: doc._tags,
        hasWritePermission: doc.hasWritePermission ?? false,
        hasOnlySubtreeWritePermission:
          doc.hasOnlySubtreeWritePermission ?? false,
        isRoot: null,
        isAddress: null,
      };
    });
  }

  private updateTreeStore(doc: DocumentWithMetadata, address: boolean) {
    const absDoc = this.mapToDocumentAbstracts([doc])[0];
    return this.updateOpenedDocumentInTreestore(absDoc, address);
  }

  private reloadDocumentIfOpenedChanged(isAddress: boolean, srcIDs: number[]) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;
    let openedDocument = store.getValue().openedDocument;
    const openedDocId = openedDocument?.id as number;
    const openedDocWasMoved = srcIDs.indexOf(openedDocId) !== -1;
    if (openedDocWasMoved) {
      this.reload$.next({ uuid: openedDocument?._uuid, forAddress: isAddress });
    }
  }

  private mapSearchResults(
    result: ServerSearchResult | ResearchResponse,
  ): SearchResult {
    return {
      totalHits: result.totalHits,
      hits: this.mapSearchResponseToDocumentAbstracts(result.hits),
    } as SearchResult;
  }

  @transaction()
  private updateStoreAfterDelete(ids: number[], isAddress: boolean) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    let entities = store.getValue().entities;
    const parents = ids.map((id) => entities[id]?._parent);

    store.remove(ids);

    // which parents do not have any children anymore?
    entities = store.getValue().entities;
    const parentsWithNoChildren = parents.filter(
      (parent) =>
        !Object.values(entities).some((entity) => entity._parent === parent),
    );

    parentsWithNoChildren.forEach((parent) => {
      store.update(parent, {
        _hasChildren: false,
      });
    });
  }

  @transaction()
  private updateStoreAfterMove(
    ids: number[],
    parent: number,
    isAddress: boolean,
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    // update moved datasets with new parent
    ids.forEach((id) => {
      const parentId = store.getValue().entities[id]._parent;

      store.update(id, { _parent: parent, isRoot: parent === null });

      // update children information of parent of each moved dataset
      const entities = store.getValue().entities;
      const hasChildren = Object.keys(entities).some(
        (key) => entities[key]._parent === parentId,
      );

      if (parentId !== null && !hasChildren) {
        store.update(parentId, {
          _hasChildren: false,
        });
      }
    });

    // update children information of destination
    if (parent !== null) {
      store.update(parent, {
        _hasChildren: true,
      });
    }

    // @ts-ignore
    store.update({
      datasetsChanged: {
        type: UpdateType.Move,
        data: ids.map((id) => ({ id: id })),
        parent: parent,
      },
    });
  }

  @transaction()
  private updateStoreAfterCopy(
    infos: DocumentAbstract[],
    parentId: number,
    isAddress: boolean,
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    infos.forEach((info) => {
      store.upsert(info.id, info);
    });

    // update parent in case it didn't have children before
    if (parentId) {
      store.update(parentId, {
        _hasChildren: true,
      });
    }
  }

  private getChildrenIfNotDoneYet(
    parent: number,
    isAddress: boolean,
  ): Observable<DocumentAbstract[]> {
    if (parent !== null) {
      const store = isAddress ? this.addressTreeStore : this.treeStore;
      const entities = store.getValue().entities;
      const parentNode = entities[parent];

      // if a parent says it has children, but none are found then these have not been loaded yet
      // in that case load them so that the caller can continue after store has been updated
      if (parentNode._hasChildren) {
        const hasAnyChildren = Object.keys(entities).some(
          (id) => entities[id]._parent === parent,
        );
        if (!hasAnyChildren) {
          return this.getChildren(parent, isAddress);
        }
      }
    }

    return of([]);
  }

  private preparePath(result: PathResponse[]) {
    return result.map(
      (pathItem) =>
        new ShortTreeNode(
          pathItem.id,
          pathItem.title,
          pathItem.permission,
          !pathItem.permission.canWrite,
        ),
    );
  }

  private getPathFromTreeStore(
    entities: HashMap<DocumentAbstract>,
    id: number,
  ): ShortTreeNode[] {
    const entity = entities[id];

    if (entity) {
      const shortTreeNode = this.mapEntityToShortTreeNode(entity);
      if (entity._parent == null) {
        return [shortTreeNode];
      }
      const pathFromTreeStore = this.getPathFromTreeStore(
        entities,
        entity._parent,
      );
      if (pathFromTreeStore === null) return null;
      return [shortTreeNode, ...pathFromTreeStore];
    }

    // if a parent could not be found, get path from backend
    return null;
  }

  private mapEntityToShortTreeNode(entity: DocumentAbstract) {
    return new ShortTreeNode(
      <number>entity.id,
      entity.title,
      {
        // canRead is always true, as you can not get a Document without having at least read access
        canRead: true,
        canWrite: entity.hasWritePermission,
        canOnlyWriteSubtree: entity.hasOnlySubtreeWritePermission,
      },
      !entity.hasWritePermission,
    );
  }

  private getCurrentUserQuery(fromCurrentUser: boolean) {
    return fromCurrentUser
      ? "and document1.modifiedbyuser = " +
          this.configService.$userInfo.getValue().id
      : "";
  }

  replaceAddress(source: string, target: string): Observable<any> {
    return this.http.post(
      `${this.configuration.backendUrl}datasets/${source}/replaceAddress/${target}`,
      null,
    );
  }

  getUsersWithPermission(id: number): Observable<any> {
    return this.http.post(
      `${this.configuration.backendUrl}datasets/${id}/users`,
      null,
    );
  }

  setResponsibleUser(datasetId: number, userId: number) {
    return this.http.post(
      `${this.configuration.backendUrl}datasets/${datasetId}/responsibleUser/${userId}`,
      null,
    );
  }

  validateDocument(id: number) {
    return this.http.post(
      `${this.configuration.backendUrl}datasets/${id}/validate`,
      null,
    );
  }
}

export class SaveOptions {
  data: IgeDocument;
  id: number;
  version: number;
  type?: string;
  parentId?: number;
  isNewDoc?: boolean;
  isAddress?: boolean;
  uuid?: string;
  path?: number[];
  noVisualUpdates?: boolean;
  dontUpdateForm?: boolean;

  static createNewDocument(
    data: IgeDocument,
    type: string,
    parentId: number,
    isAddress: boolean,
    pathIds: number[] = null,
    skipFormUpdate: boolean = false,
    uuid: string = null,
  ) {
    return {
      id: null,
      version: null,
      type: type,
      parentId: parentId,
      data: data,
      isNewDoc: true,
      isAddress: isAddress,
      uuid: uuid,
      path: pathIds,
      noVisualUpdates: skipFormUpdate,
      dontUpdateForm: skipFormUpdate,
    };
  }
}

export class PostSaveOptions extends SaveOptions {
  dataWithMetadata: DocumentWithMetadata;
}
