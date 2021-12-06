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
import { applyTransaction, transaction } from "@datorama/akita";
import { MessageService } from "../message.service";
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

export type AddressTitleFn = (address: IgeDocument) => string;

export interface ReloadData {
  id: string;
  forAddress: boolean;
}

@Injectable({
  providedIn: "root",
})
export class DocumentService {
  // TODO: check usefulness
  beforePublish$ = new Subject<any>();
  beforeSave$ = new Subject<any>();
  afterSave$ = new Subject<any>();
  afterLoadAndSet$ = new Subject<any>();
  documentOperationFinished$ = new Subject<any>();
  publishState$ = new BehaviorSubject<boolean>(false);
  reload$ = new Subject<ReloadData>();

  private configuration: Configuration;
  private alternateAddressTitle: (IgeDocument) => string = null;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
    private modalService: ModalService,
    private dataService: DocumentDataService,
    private messageService: MessageService,
    private profileService: ProfileService,
    private sessionStore: SessionStore,
    private sessionQuery: SessionQuery,
    private treeStore: TreeStore,
    private addressTreeStore: AddressTreeStore
  ) {
    this.configuration = configService.getConfiguration();
  }

  find(query: string, size = 10, address = false): Observable<SearchResult> {
    // TODO: use general sort filter
    const encodedQuery = encodeURI(query).replace(/#/g, "%23");
    return this.http
      .get<ServerSearchResult>(
        `${this.configuration.backendUrl}datasets?query=${encodedQuery}&sort=title&size=${size}&address=${address}`
      )
      .pipe(map((result) => this.mapSearchResults(result)));
  }

  findRecent(): void {
    this.http
      .get<ServerSearchResult>(
        `${this.configuration.backendUrl}datasets?query=&sort=modified&sortOrder=DESC&size=5`
      )
      .pipe(
        map((result) => this.mapSearchResults(result)),
        tap((docs) => this.sessionStore.update({ latestDocuments: docs.hits }))
      )
      .subscribe();
  }

  findRecentAddresses(): Observable<DocumentAbstract[]> {
    return this.http
      .get<ServerSearchResult>(
        `${this.configuration.backendUrl}datasets?query=&address=true&sort=modified&sortOrder=DESC&size=5`
      )
      .pipe(
        map((result) => this.mapSearchResults(result).hits)
        // TODO create and use latestAddresses Sessionstore
        // tap(docs => this.sessionStore.update({latestDocuments: docs.hits}))
      );
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
    this.preSaveActions(data, isAddress);

    return this.dataService.save(data, isAddress).pipe(
      filter(() => !noVisualUpdates),
      tap(() => this.messageService.sendInfo("Ihre Eingabe wurde gespeichert")),
      tap((json) => this.postSaveActions(json, isNewDoc, path, isAddress)),
      finalize(() => this.documentOperationFinished$.next(true))
    );
  }

  private preSaveActions(data: IgeDocument, isAddress: boolean) {
    if (isAddress && data._type !== "FOLDER") {
      // recreate address title, as it can not be changed manually for addresses
      data.title = this.createAddressTitle(data);
    }

    this.beforeSave$.next();
    this.documentOperationFinished$.next(false);
  }

  postSaveActions(
    json: any,
    isNewDoc: boolean,
    path: string[],
    isAddress: boolean
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    this.afterSave$.next(json);

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
  publish(data: IgeDocument, isAddress: boolean): Observable<void> {
    const errors: any = { errors: [] };

    this.preSaveActions(data, isAddress);

    this.beforePublish$.next(errors);
    console.log("After validation:", data);
    const formInvalid = errors.errors.filter((err: any) => err.invalid)[0];
    if (formInvalid && formInvalid.invalid) {
      this.modalService.showJavascriptError(
        "Der Datensatz kann nicht veröffentlicht werden."
      );
      return;
    }

    return this.dataService.publish(data).pipe(
      // catchError((error) => this.handlePublishError(error, data, isAddress)),
      filter((response) => response),
      tap(() =>
        this.messageService.sendInfo("Das Dokument wurde veröffentlicht.")
      ),
      tap((json) => this.postSaveActions(json, false, null, isAddress)),
      finalize(() => this.documentOperationFinished$.next(true))
    );
  }

  unpublish(id: string, forAddress: boolean): Observable<any> {
    const store = forAddress ? this.addressTreeStore : this.treeStore;
    return this.dataService.unpublish(id).pipe(
      catchError((error) => {
        if (error?.error?.errorCode === "POST_SAVE_ERROR") {
          console.error(error?.error?.errorText);
          this.messageService.sendError(
            "Problem beim Entziehen der Veröffentlichung: " +
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
      tap(() => this.reload$.next({ id, forAddress: forAddress })),
      tap(() =>
        this.messageService.sendInfo(
          "Die Veröffentlichung wurde zurückgezogen."
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
    if (error?.error?.errorCode === "IS_REFERENCED_ERROR") {
      console.error(error?.error?.errorText);
      let uniqueUuids = [...new Set(error?.error?.data?.uuids)];

      this.messageService.sendError(
        "Das Dokument wird von den folgenden Dokumenten referenziert: " +
          uniqueUuids.join(", ")
      );
    }
    // unknown error
    throw error;
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
      // tap(json => this.treeStore.update(id, json[0])),
      // tap(json => this.updateOpenedDocumentInTreestore(null, isAddress)),
      tap(() => this.reload$.next({ id, forAddress: isAddress }))
      // catchError( err => this.errorService.handle( err ) )
    );
  }

  getPath(id: string): Observable<ShortTreeNode[]> {
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
      }),
      catchError((error) => {
        if (error.error.errorText.indexOf("is part of the hierarchy")) {
          throw new IgeError(
            "Kopieren von Dokumentenbäumen unter sich selbst ist nicht möglich"
          );
        }
        throw error;
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
      const fields = [
        address.organization,
        address.lastName,
        address.firstName,
      ].filter((item) => item);
      return fields.join(", ");
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

  public addToRecentAdresses(address: DocumentAbstract) {
    let addresses = this.sessionQuery.recentAddresses.slice();
    addresses = addresses.filter((ad) => ad.id !== address.id);
    addresses.unshift(address);

    // only store 5 most recent addresses
    if (addresses.length > 5) {
      addresses = addresses.slice(0, 5);
    }
    this.sessionStore.update({ recentAddresses: addresses });
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

  private mapToDocumentAbstracts(
    docs: IgeDocument[],
    parentId?: string
  ): DocumentAbstract[] {
    return docs.map((doc) => {
      return {
        id: doc._id ? doc._id.toString() : null,
        icon: this.profileService.getDocumentIcon(doc),
        title: doc.title || "-Ohne Titel-",
        _uuid: doc._uuid,
        _state: doc._state,
        _hasChildren: doc._hasChildren,
        _parent: parentId ? parentId.toString() : null,
        _type: doc._type,
        _modified: doc._modified,
        hasWritePermission: doc.hasWritePermission ?? false,
        hasOnlySubtreeWritePermission:
          doc.hasOnlySubtreeWritePermission ?? false,
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
    const openedDocId = store.getValue().openedDocument?.id.toString();
    const openedDocWasMoved = srcIDs.indexOf(openedDocId) !== -1;
    if (openedDocWasMoved) {
      this.reload$.next({ id: openedDocId, forAddress: isAddress });
    }
  }

  private mapSearchResults(result: ServerSearchResult): SearchResult {
    return {
      totalHits: result.totalHits,
      hits: this.mapToDocumentAbstracts(result.hits, null),
    } as SearchResult;
  }

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

  private updateStoreAfterMove(
    ids: string[],
    parent: string,
    isAddress: boolean
  ) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    ids.forEach((id) => {
      store.update(id, { _parent: parent });
    });

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
          pathItem.permission.canOnlyWriteSubtree,
          !pathItem.permission.canWrite
        )
    );
  }
}
