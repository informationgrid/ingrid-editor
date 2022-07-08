import { Injectable } from "@angular/core";
import { ModalService } from "../modal/modal.service";
import { UpdateType } from "../../models/update-type.enum";
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import {
  catchError,
  filter,
  finalize,
  map,
  switchMap,
  tap,
} from "rxjs/operators";
import { IgeDocument } from "../../models/ige-document";
import { DocumentDataService } from "./document-data.service";
import {
  ADDRESS_ROOT_NODE,
  DOCUMENT_ROOT_NODE,
  DocumentAbstract,
} from "../../store/document/document.model";
import { TreeStore } from "../../store/tree/tree.store";
import { applyTransaction, HashMap, transaction } from "@datorama/akita";
import { FormMessageService } from "../form-message.service";
import { ProfileService } from "../profile.service";
import { SessionStore } from "../../store/session.store";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ConfigService, Configuration } from "../config/config.service";
import { SearchResult } from "../../models/search-result.model";
import { ServerSearchResult } from "../../models/server-search-result.model";
import { AddressTreeStore } from "../../store/address-tree/address-tree.store";
import { StatisticResponse } from "../../models/statistic.model";
import { IgeError } from "../../models/ige-error";
import { SessionQuery } from "../../store/session.query";
import { PathResponse } from "../../models/path-response";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { TreeQuery } from "../../store/tree/tree.query";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";
import {
  ResearchResponse,
  ResearchService,
} from "../../+research/research.service";
import { DocEventsService } from "../event/doc-events.service";
import * as path from "path";

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
    private messageService: FormMessageService,
    private profileService: ProfileService,
    private sessionStore: SessionStore,
    private sessionQuery: SessionQuery,
    private treeStore: TreeStore,
    private addressTreeStore: AddressTreeStore,
    private researchService: ResearchService,
    private docEvents: DocEventsService
  ) {
    this.configuration = configService.getConfiguration();
  }

  find(query: string, size = 10, address = false): Observable<SearchResult> {
    return this.researchService
      .search(
        query,
        { type: address ? "selectAddresses" : "selectDocuments" },
        null,
        "DESC",
        { page: 1, pageSize: size }
      )
      .pipe(map((result) => this.mapSearchResults(result)));
  }

  findRecent(): void {
    this.researchService
      .search("", { type: "selectDocuments" }, "modified", "DESC", {
        page: 1,
        pageSize: 10,
      })
      .pipe(
        map((result) => this.mapSearchResults(result)),
        tap((docs) => this.sessionStore.update({ latestDocuments: docs.hits }))
      )
      .subscribe();
  }

  findRecentAddresses(): void {
    this.researchService
      .search("", { type: "selectAddresses" }, "modified", "DESC", {
        page: 1,
        pageSize: 10,
      })
      .pipe(
        map((result) => this.mapSearchResults(result)),
        tap((docs) => this.sessionStore.update({ latestAddresses: docs.hits }))
      )
      .subscribe();
  }

  getChildren(
    parentId: string,
    isAddress?: boolean
  ): Observable<DocumentAbstract[]> {
    return this.dataService.getChildren(parentId, isAddress).pipe(
      map((docs) => this.mapToDocumentAbstracts(docs, parentId)),
      tap((docs) => this.updateTreeStoreDocs(isAddress, parentId, docs))
    );
  }

  load(
    id: string,
    address?: boolean,
    updateStore = true,
    useUuid = false
  ): Observable<IgeDocument> {
    this.documentOperationFinished$.next(false);
    return this.dataService.load(id, useUuid).pipe(
      tap((doc) => {
        if (updateStore) {
          this.updateTreeStore(doc, address);
        }
      }),
      tap((doc) => this.docEvents.sendAfterLoadAndSet(doc)),
      catchError((e: HttpErrorResponse) => this.handleLoadError(e)),
      finalize(() => this.documentOperationFinished$.next(true))
    );
  }

  updateOpenedDocumentInTreestore(
    doc: DocumentAbstract,
    address: boolean,
    keepOpenedDocument = false
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

  // TODO: Refactor to use options instead so many parameters
  save(
    data: IgeDocument,
    isNewDoc?: boolean,
    isAddress?: boolean,
    path?: string[],
    noVisualUpdates = false
  ): Observable<IgeDocument> {
    const doc = this.preSaveActions(data, isAddress);

    return this.dataService.save(doc, isAddress).pipe(
      filter(() => !noVisualUpdates),
      tap(() => this.messageService.sendInfo("Ihre Eingabe wurde gespeichert")),
      tap((json) => this.postSaveActions(json, isNewDoc, path, isAddress)),
      finalize(() => this.documentOperationFinished$.next(true))
    );
  }

  private preSaveActions(data: IgeDocument, isAddress: boolean): IgeDocument {
    if (isAddress && data._type !== "FOLDER") {
      // recreate address title, as it can not be changed manually for addresses
      data.title = this.createAddressTitle(data);
    }

    this.docEvents.sendBeforeSave();
    this.documentOperationFinished$.next(false);

    return DocumentService.trimObject(data);
  }

  private static trimObject(obj: IgeDocument): IgeDocument {
    const trimmed = JSON.stringify(obj, (key, value) => {
      return typeof value === "string" ? value.trim() : value;
    });
    return JSON.parse(trimmed);
  }

  postSaveActions(
    json: any,
    isNewDoc: boolean,
    path: string[],
    isAddress: boolean
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    this.docEvents.sendAfterSave(json);

    const parentId = json._parent;
    const info = this.mapToDocumentAbstracts([json], parentId)[0];

    // after renaming a folder the folder must still be expandable
    if (!isNewDoc) {
      const entity = store.getValue().entities[info.id];
      if (entity) {
        info._hasChildren = entity._hasChildren;
      }
    }

    this.updateOpenedDocumentInTreestore(info, isAddress);

    // update state by adding node and updating parent info
    store.upsert(info.id, info);
    if (isNewDoc && parentId) {
      store.update(parentId, {
        _hasChildren: true,
      });
    }

    store.update({
      datasetsChanged: {
        type: isNewDoc ? UpdateType.New : UpdateType.Update,
        data: [info],
        parent: parentId,
        path: path,
      },
    });
  }

  // FIXME: this should be added with a plugin
  publish(
    data: IgeDocument,
    isAddress: boolean,
    publishDate: Date = null
  ): Observable<any> {
    const doc = this.preSaveActions(data, isAddress);

    return this.dataService.publish(doc, publishDate).pipe(
      // catchError((error) => this.handlePublishError(error, data, isAddress)),
      filter((response) => response),
      tap(() => {
        if (!publishDate)
          this.messageService.sendInfo("Das Dokument wurde veröffentlicht.");
      }),
      tap((json) => this.postSaveActions(json, false, null, isAddress)),
      finalize(() => this.documentOperationFinished$.next(true))
    );
  }

  unpublish(id: string, forAddress: boolean): Observable<any> {
    const store = forAddress ? this.addressTreeStore : this.treeStore;
    return this.dataService.unpublish(id).pipe(
      catchError((error) => {
        return this.handleUnpublishError(error, id);
      }),
      map((json) => this.mapToDocumentAbstracts([json], json._parent)),
      tap((json) =>
        store.update({
          datasetsChanged: { type: UpdateType.Update, data: json },
        })
      ),
      tap((doc) =>
        this.reload$.next({ uuid: doc[0]._uuid, forAddress: forAddress })
      ),
      tap((doc) => store.upsert(doc[0].id, doc[0])),
      tap(() =>
        this.messageService.sendInfo(
          "Die Veröffentlichung wurde zurückgezogen."
        )
      )
    );
  }

  cancelPendingPublishing(id: string, forAddress: boolean): Observable<any> {
    const store = forAddress ? this.addressTreeStore : this.treeStore;
    return this.dataService.cancelPendingPublishing(id).pipe(
      catchError((error) => {
        if (error?.error?.errorCode === "POST_SAVE_ERROR") {
          console.error(error?.error?.errorText);
          this.messageService.sendError(
            "Problem beim Abbrechen der geplanten Veröffentlichung: " +
              error?.error?.errorText
          );
          return this.load(id);
        }
      }),
      map((json) => this.mapToDocumentAbstracts([json], json._parent)),
      tap((json) =>
        store.update({
          datasetsChanged: { type: UpdateType.Update, data: json },
        })
      ),
      tap((doc) =>
        this.reload$.next({ uuid: doc[0]._uuid, forAddress: forAddress })
      ),
      tap(() =>
        this.messageService.sendInfo(
          "Die geplante Veröffentlichung wurde abgebrochen."
        )
      )
    );
  }

  delete(ids: string[], isAddress: boolean): Observable<void> {
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
      catchError((error) => this.handleDeleteError(error))
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
            error?.error?.errorText
        );
        return this.load(id);
    }
    throw error;
  }

  private handleIsReferencedError(error) {
    console.error(error?.error?.errorText);

    this.messageService.sendError(
      `Das Dokument wird von mindestens einem Dokument referenziert.
      Diese können über das Feld 'Zugeordnete Datensätze' angezeigt werden.
      Lösen Sie diese auf oder wenden Sie sich an den Katalog-Administrator.`
    );
  }

  revert(id: string, isAddress: boolean): Observable<any> {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    return this.dataService.revert(id).pipe(
      map((json) => this.mapToDocumentAbstracts([json], json._parent)),
      map((json) => {
        json[0]._hasChildren = store.getValue().entities[id]._hasChildren;
        return json;
      }),
      tap((json) =>
        store.update({
          datasetsChanged: { type: UpdateType.Update, data: json },
        })
      ),
      tap((doc: DocumentAbstract[]) =>
        this.reload$.next({ uuid: doc[0]._uuid, forAddress: isAddress })
      )
    );
  }

  getPath(id: string): Observable<ShortTreeNode[]> {
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
      map((path) => this.preparePath(path))
    );
  }

  private getEntitiesFromStoreContainingId(id: string) {
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
   * @param includeTree, if set to tree then the whole tree is being copied instead of just the selected document
   * @param isAddress
   * @returns {Observable<Response>}
   */
  copy(
    srcIDs: string[],
    dest: string,
    includeTree: boolean,
    isAddress: boolean
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;
    return this.dataService.copy(srcIDs, dest, includeTree).pipe(
      tap((docs) => {
        this.messageService.sendInfo("Datensatz wurde kopiert");

        const infos = this.mapToDocumentAbstracts(docs, dest);

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
      })
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
    srcIDs: string[],
    dest: string,
    isAddress: boolean,
    confirm = false
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
        })
      );

    if (confirm) {
      const store = isAddress ? this.addressTreeStore : this.treeStore;

      let destinationTitle;
      if (dest === null) {
        destinationTitle = isAddress
          ? ADDRESS_ROOT_NODE.title
          : DOCUMENT_ROOT_NODE.title;
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
          tap(() => moveOperation().subscribe())
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
        "There are multiple sort functions registered for the tree. Will ignore others!"
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
      `${this.configuration.backendUrl}statistic`
    );
  }

  public addToRecentAddresses(address: DocumentAbstract) {
    const catalogId = this.configService.$userInfo.getValue().currentCatalog.id;
    const recentAddresses = this.sessionQuery.recentAddresses;

    let addresses = recentAddresses[catalogId]?.slice() ?? [];
    addresses = addresses.filter((address) => address.id !== address.id);
    addresses.unshift(address);

    // only store 5 most recent addresses
    if (addresses.length > 5) {
      addresses = addresses.slice(0, 5);
    }

    this.sessionStore.update({
      recentAddresses: { ...recentAddresses, [catalogId]: addresses },
    });
  }

  public removeFromRecentAddresses(id: string) {
    const catalogId = this.configService.$userInfo.getValue().currentCatalog.id;
    const recentAddresses = this.sessionQuery.recentAddresses;

    let addresses = recentAddresses[catalogId]?.slice() ?? [];
    addresses = addresses.filter((address) => address.id !== id);

    this.sessionStore.update({
      recentAddresses: { ...recentAddresses, [catalogId]: addresses },
    });
  }

  updateBreadcrumb(
    id: string,
    query: TreeQuery | AddressTreeQuery,
    isAddress = false
  ): Subscription {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    return this.getPath(id)
      .pipe(
        tap((path) =>
          store.update({
            breadcrumb: path,
          })
        )
      )
      .subscribe();
  }

  private updateTreeStoreDocs(
    isAddress: boolean,
    parentId: string,
    docs: DocumentAbstract[]
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;
    if (parentId === null) {
      store.set(docs);
    } else {
      store.add(docs);
    }
  }

  mapToDocumentAbstracts(
    docs: IgeDocument[],
    parentId?: string
  ): DocumentAbstract[] {
    return docs.map((doc) => {
      return {
        id: doc._id ? doc._id.toString() : null,
        icon: this.profileService.getDocumentIcon(doc),
        title: doc.title || "-Kein Titel-",
        _uuid: doc._uuid,
        _state: doc._state,
        _hasChildren: doc._hasChildren,
        _parent: doc._parent?.toString() ?? null,
        _type: doc._type,
        _modified: doc._modified,
        _pendingDate: doc._pendingDate,
        hasWritePermission: doc.hasWritePermission ?? false,
        hasOnlySubtreeWritePermission:
          doc.hasOnlySubtreeWritePermission ?? false,
        isRoot: parentId === null,
      };
    });
  }

  private handleLoadError(e: HttpErrorResponse) {
    if (e.status === 404) {
      const error = new IgeError();
      error.setMessage("Der Datensatz konnte nicht gefunden werden");
      this.modalService.showIgeError(error);
      return of(null);
    } else {
      throw e;
    }
  }

  private updateTreeStore(doc: IgeDocument, address: boolean) {
    const absDoc = this.mapToDocumentAbstracts([doc], doc._parent)[0];
    return this.updateOpenedDocumentInTreestore(absDoc, address);
  }

  private reloadDocumentIfOpenedChanged(isAddress: boolean, srcIDs: string[]) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;
    let openedDocument = store.getValue().openedDocument;
    const openedDocId = openedDocument?.id?.toString();
    const openedDocWasMoved = srcIDs.indexOf(openedDocId) !== -1;
    if (openedDocWasMoved) {
      this.reload$.next({ uuid: openedDocument?._uuid, forAddress: isAddress });
    }
  }

  private mapSearchResults(
    result: ServerSearchResult | ResearchResponse
  ): SearchResult {
    return {
      totalHits: result.totalHits,
      hits: this.mapToDocumentAbstracts(result.hits, null),
    } as SearchResult;
  }

  @transaction()
  private updateStoreAfterDelete(ids: string[], isAddress: boolean) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    let entities = store.getValue().entities;
    const parents = ids.map((id) => entities[id]?._parent);

    store.remove(ids);

    // which parents do not have any children anymore?
    entities = store.getValue().entities;
    const parentsWithNoChildren = parents.filter(
      (parent) =>
        !Object.values(entities).some((entity) => entity._parent === parent)
    );

    parentsWithNoChildren.forEach((parent) => {
      store.update(parent, {
        _hasChildren: false,
      });
    });
  }

  @transaction()
  private updateStoreAfterMove(
    ids: string[],
    parent: string,
    isAddress: boolean
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    // update moved datasets with new parent
    ids.forEach((id) => {
      const parentId = store.getValue().entities[id]._parent;

      store.update(id, { _parent: parent, isRoot: parent === null });

      // update children information of parent of each moved dataset
      const entities = store.getValue().entities;
      const hasChildren = Object.keys(entities).some(
        (key) => entities[key]._parent === parentId
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
    parentId: string,
    isAddress: boolean
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
    parent: string,
    isAddress: boolean
  ): Observable<DocumentAbstract[]> {
    if (parent !== null) {
      const store = isAddress ? this.addressTreeStore : this.treeStore;
      const entities = store.getValue().entities;
      const parentNode = entities[parent];

      // if a parent says it has children, but none are found then these have not been loaded yet
      // in that case load them so that the caller can continue after store has been updated
      if (parentNode._hasChildren) {
        const hasAnyChildren = Object.keys(entities).some(
          (id) => entities[id]._parent === parent
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
          pathItem.id.toString(),
          pathItem.title,
          pathItem.permission,
          !pathItem.permission.canWrite
        )
    );
  }

  private getPathFromTreeStore(
    entities: HashMap<DocumentAbstract>,
    id: string
  ): ShortTreeNode[] {
    const entity = entities[id];

    if (entity) {
      const shortTreeNode = this.mapEntityToShortTreeNode(entity);
      if (entity._parent == null) {
        return [shortTreeNode];
      }
      const pathFromTreeStore = this.getPathFromTreeStore(
        entities,
        entity._parent
      );
      if (pathFromTreeStore === null) return null;
      return [shortTreeNode, ...pathFromTreeStore];
    }

    // if a parent could not be found, get path from backend
    return null;
  }

  private mapEntityToShortTreeNode(entity: DocumentAbstract) {
    return new ShortTreeNode(
      entity.id.toString(),
      entity.title,
      {
        canRead: true,
        canWrite: entity.hasWritePermission,
        canOnlyWriteSubtree: entity.hasOnlySubtreeWritePermission,
      },
      !entity.hasWritePermission
    );
  }

  replaceAddress(source: string, target: string): Observable<any> {
    return this.http.post(
      `${this.configuration.backendUrl}datasets/${source}/replaceAddress/${target}`,
      null
    );
  }
}
