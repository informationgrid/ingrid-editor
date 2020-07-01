import {Injectable} from '@angular/core';
import {ModalService} from '../modal/modal.service';
import {UpdateType} from '../../models/update-type.enum';
import {UpdateDatasetInfo} from '../../models/update-dataset-info.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {IgeDocument} from '../../models/ige-document';
import {DocumentDataService} from './document-data.service';
import {DocumentAbstract} from '../../store/document/document.model';
import {TreeStore} from '../../store/tree/tree.store';
import {applyTransaction, arrayAdd, arrayRemove} from '@datorama/akita';
import {MessageService} from '../message.service';
import {ProfileService} from '../profile.service';
import {SessionStore} from '../../store/session.store';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../config/config.service';
import {SearchResult} from '../../models/search-result.model';
import {ServerSearchResult} from '../../models/server-search-result.model';
import {AddressTreeStore} from '../../store/address-tree/address-tree.store';
import {StatisticResponse} from '../../models/statistic.model';

export type AddressTitleFn = (address: IgeDocument) => string;

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  // TODO: check usefulness
  beforePublish$ = new Subject<any>();
  afterSave$ = new Subject<any>();
  afterLoadAndSet$ = new Subject<any>();
  afterProfileSwitch$ = new Subject<any>();
  datasetsChanged$ = new Subject<UpdateDatasetInfo>();
  publishState$ = new BehaviorSubject<boolean>(false);
  private configuration: Configuration;
  private alternateAddressTitle: (IgeDocument) => string = null;

  constructor(private http: HttpClient, configService: ConfigService,
              private modalService: ModalService,
              private dataService: DocumentDataService,
              private messageService: MessageService,
              private profileService: ProfileService,
              private sessionStore: SessionStore,
              private treeStore: TreeStore,
              private addressTreeStore: AddressTreeStore) {
    this.configuration = configService.getConfiguration();
  }

  find(query: string, size = 10, address = false): Observable<SearchResult> {
    // TODO: use general sort filter
    return this.http.get<ServerSearchResult>(
      `${this.configuration.backendUrl}datasets?query=${query}&sort=title&size=${size}&address=${address}`)
      .pipe(
        // map(json => json.filter(item => item && item._type !== 'FOLDER')),
        map(result => this.mapSearchResults(result))
        // catchError( err => this.errorService.handleOwn( 'Could not query documents', err ) )
      );
  }

  findRecent(): void {
    this.http.get<ServerSearchResult>(`${this.configuration.backendUrl}datasets?query=&sort=_modified&sortOrder=DESC&size=5`)
      .pipe(
        // map(json => json.filter(item => item && item._type !== 'FOLDER')),
        map(result => this.mapSearchResults(result)),
        tap(docs => this.sessionStore.update({latestDocuments: docs.hits}))
        // catchError( err => this.errorService.handleOwn( 'Could not query documents', err ) )
      ).subscribe();
  }

  getChildren(parentId: string, isAddress?: boolean): Observable<DocumentAbstract[]> {
    return this.dataService.getChildren(parentId, isAddress)
      .pipe(
        map(docs => this.mapToDocumentAbstracts(docs, parentId)),
        map(docs => docs.sort((a, b) => a.title.localeCompare(b.title))),
        tap(docs => this.updateTreeStoreDocs(isAddress, parentId, docs))
      );
  }

  private updateTreeStoreDocs(isAddress: boolean, parentId: string, docs: DocumentAbstract[]) {
    const store = isAddress ? this.addressTreeStore : this.treeStore;
    if (parentId === null) {
      store.set(docs);
    } else {
      store.add(docs);
      // this.treeStore.setExpandedNodes([...previouseExpandState, nodeId]);
    }
  }

  private mapToDocumentAbstracts(docs: IgeDocument[], parentId?: string): DocumentAbstract[] {
    return docs.map(doc => {
      return {
        id: doc._id,
        icon: this.profileService.getDocumentIcon(doc),
        title: doc.title || '-Ohne Titel-',
        _state: doc._state,
        _hasChildren: doc._hasChildren,
        _parent: parentId,
        _type: doc._type,
        _modified: doc._modified
      };
    });
  }

  load(id: string, address?: boolean): Observable<IgeDocument> {
    return this.dataService.load(id).pipe(
      tap(doc => this.updateTreeStore(doc, address))
    );
  }

  private updateTreeStore(doc: IgeDocument, address: boolean) {
    const absDoc = this.mapToDocumentAbstracts([doc], doc._parent)[0];
    return this.updateOpenedDocumentInTreestore(absDoc, address);
  }

  updateOpenedDocumentInTreestore(doc: DocumentAbstract, address: boolean, keepOpenedDocument = false) {
    const store = address ? this.addressTreeStore : this.treeStore;

    applyTransaction(() => {
      setTimeout(() => store.setActive(doc ? [doc.id] : []), 0);
      if (!keepOpenedDocument) {
        return store.update({
          openedDocument: doc
        });
      }
    });
  }

  save(data: IgeDocument, isNewDoc?: boolean, isAddress?: boolean, path?: string[]): Promise<IgeDocument> {
    const store = isAddress ? this.addressTreeStore : this.treeStore;

    return this.dataService.save(data, isAddress)
      .toPromise().then(json => {
        const info = this.mapToDocumentAbstracts([json], json._parent)[0];

        // TODO: this should be controlled by dynamic-form component
        this.messageService.sendInfo('Ihre Eingabe wurde gespeichert');

        this.afterSave$.next(json);

        store.upsert(info.id, info);

        this.datasetsChanged$.next({
          type: isNewDoc ? UpdateType.New : UpdateType.Update,
          data: [info],
          parent: info._parent,
          path: path
        });

        return json;
      });
  }

  // FIXME: this should be added with a plugin
  publish(data: IgeDocument): Promise<void> {
    console.log('PUBLISHING');
    const errors: any = {errors: []};

    this.beforePublish$.next(errors);
    console.log('After validation:', data);
    const formInvalid = errors.errors.filter((err: any) => err.invalid)[0];
    if (formInvalid && formInvalid.invalid) {
      this.modalService.showJavascriptError('Der Datensatz kann nicht veröffentlicht werden.');
      return;
    }

    return this.dataService.publish(data)
      .toPromise().then(json => {
          const info = this.mapToDocumentAbstracts([json], json._parent)[0];

          this.afterSave$.next(json);
          this.datasetsChanged$.next({
            type: UpdateType.Update,
            data: [info]
          });
          this.treeStore.upsert(info.id, info);
        }
      );
  }

  delete(ids: string[]): void {
    this.dataService.delete(ids)
      .subscribe(res => {
        console.log('ok', res);
        const data = ids.map(id => {
          return {id: id};
        });
        this.datasetsChanged$.next({
          type: UpdateType.Delete,
          // @ts-ignore
          data: data
        });
        this.treeStore.remove(ids);
      });
  }

  revert(id: string): Observable<any> {
    return this.dataService.revert(id)
      .pipe(
        tap((json: any) => this.datasetsChanged$.next({type: UpdateType.Update, data: [json]}))
        // catchError( err => this.errorService.handle( err ) )
      );
  }

  getPath(id: string): Observable<string[]> {
    return this.dataService.getPath(id).pipe(
      // tap( path => this.treeStore.setExpandedNodes(path))
    );
  }

  /**
   * Copy a set of documents under a specified destination document.
   * @param copiedDatasets contains the IDs of the documents to be copied
   * @param dest is the document, where the other docs to be copied will have as their parent
   * @param includeTree, if set to tree then the whole tree is being copied instead of just the selected document
   * @returns {Observable<Response>}
   */
  copy(srcIDs: string[], dest: string, includeTree: boolean) {
    return this.dataService.copy(srcIDs, dest, includeTree);
  }

  /**
   * Move a set of documents under a specified destination document.
   * @param src contains the IDs of the documents to be moved
   * @param dest is the document, where the other docs to be copied will have as their parent
   * @param includeTree, if set to tree then the whole tree is being copied instead of just the selected document
   * @returns {Observable<Response>}
   */
  move(srcIDs: string[], dest: string, includeTree: boolean) {
    return this.dataService.move(srcIDs, dest, includeTree);
  }

  addExpandedNode(nodeId: string) {
    this.treeStore.update(node => ({expandedNodes: arrayAdd(node.expandedNodes, nodeId)}));
  }

  removeExpandedNode(nodeId: string) {
    this.treeStore.update(node => ({expandedNodes: arrayRemove(node.expandedNodes, nodeId)}));
  }

  addDocumentToStore(docs: DocumentAbstract[]) {
    this.treeStore.add(docs);
  }

  updateChildrenInfo(id: string, hasChildren: boolean) {
    this.treeStore.update(id, {
      _hasChildren: hasChildren
    });
  }

  private mapSearchResults(result: ServerSearchResult): SearchResult {
    return {
      totalHits: result.totalHits,
      hits: this.mapToDocumentAbstracts(result.hits, null)
    } as SearchResult;
  }

  createAddressTitle(address: IgeDocument) {
    if (this.alternateAddressTitle) {
      return this.alternateAddressTitle(address);
    } else {
      const fields = [address.organization, address.lastName, address.firstName]
        .filter(item => item);
      return fields.join(', ');
    }
  }

  registerAddressTitleFunction(func: AddressTitleFn) {

    if (func !== null && this.alternateAddressTitle !== null) {
      console.error('There are multiple sort functions registered for the tree. Will ignore others!');
    } else {
      this.alternateAddressTitle = func;
    }

  }

  setDocLoadingState(isLoading: boolean, address: boolean) {
    const store = address ? this.addressTreeStore : this.treeStore;
    store.update({isDocLoading: isLoading});
  }

  getDocumentIcon(doc: IgeDocument): string {
    return this.profileService.getDocumentIcon(doc);
  }

  getStatistic(): Observable<StatisticResponse> {
    return this.http.get<StatisticResponse>(`${this.configuration.backendUrl}statistic`);
  }
}
