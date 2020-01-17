import {Injectable} from '@angular/core';
import {ModalService} from '../modal/modal.service';
import {UpdateType} from '../../models/update-type.enum';
import {UpdateDatasetInfo} from '../../models/update-dataset-info.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/internal/operators';
import {IgeDocument} from '../../models/ige-document';
import {DocumentDataService} from './document-data.service';
import {DocumentAbstract} from '../../store/document/document.model';
import {TreeStore} from '../../store/tree/tree.store';
import {ProfileQuery} from '../../store/profile/profile.query';
import {arrayAdd, arrayRemove} from '@datorama/akita';
import {MessageService} from '../message.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  // TODO: check usefulness
  beforeSave$ = new Subject<any>();
  afterSave$ = new Subject<any>();
  afterLoadAndSet$ = new Subject<any>();
  afterProfileSwitch$ = new Subject<any>();
  datasetsChanged$ = new Subject<UpdateDatasetInfo>();
  publishState$ = new BehaviorSubject<boolean>(false);

  constructor(private modalService: ModalService,
              private dataService: DocumentDataService,
              private messageService: MessageService,
              private profileService: ProfileService,
              private treeStore: TreeStore) {
  }

  find(query: string): Observable<DocumentAbstract[]> {
    // TODO: use general sort filter
    return this.dataService.find(query)
      .pipe(
        map(json => json.filter(item => item && item._profile !== 'FOLDER')),
        map(docs => this.mapToDocumentAbstracts(docs, null))
        // catchError( err => this.errorService.handleOwn( 'Could not query documents', err ) )
      );
  }

  findRecent(): void {
    // TODO: use general sort filter
    this.dataService.find(null)
      .pipe(
        map(json => json.filter(item => item && item._profile !== 'FOLDER'))
        // catchError( err => this.errorService.handleOwn( 'Could not query documents', err ) )
      ).subscribe();
  }

  getChildren(parentId: string): Observable<DocumentAbstract[]> {
    return this.dataService.getChildren(parentId)
      .pipe(
        map(docs => this.mapToDocumentAbstracts(docs, parentId)),
        map(docs => docs.sort((a, b) => a.title.localeCompare(b.title))),
        tap(docs => {
          if (parentId === null) {
            this.treeStore.set(docs);
          } else {
            this.treeStore.add(docs);
            // this.treeStore.setExpandedNodes([...previouseExpandState, nodeId]);
          }
          return docs;
        })
      );
  }

  private mapToDocumentAbstracts(docs: any[], parentId: string): DocumentAbstract[] {
    return docs.map(doc => {
      return {
        id: doc._id,
        icon: this.profileService.getProfileIcon(doc._profile),
        title: doc.title || '-Ohne Titel-',
        _state: doc._state,
        _hasChildren: doc._hasChildren,
        _parent: parentId,
        _profile: doc._profile
      };
    });
  }

  load(id: string): Observable<IgeDocument> {
    return this.dataService.load(id).pipe(
      tap(doc => this.treeStore.update({
        openedDocument: this.mapToDocumentAbstracts([doc], doc._parent)[0]
      })),
      tap(doc => setTimeout(() => this.treeStore.setActive([doc._id]), 0))
    );
  }

  save(data: IgeDocument, isNewDoc?: boolean): Promise<IgeDocument> {
    return new Promise((resolve, reject) => {

      this.dataService.save(data)
        .subscribe(json => {
          const info = this.mapToDocumentAbstracts([json], json._parent)[0];

          this.messageService.sendInfo('Ihre Eingabe wurde gespeichert');

          this.afterSave$.next(data);
          this.datasetsChanged$.next({
            type: isNewDoc ? UpdateType.New : UpdateType.Update,
            data: [info],
            parent: info._parent
          });
          this.treeStore.upsert(info.id, info);
          resolve(data);
        }, err => {
          reject(err);
        });
    });
  }

  // FIXME: this should be added with a plugin
  publish(data: IgeDocument): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('PUBLISHING');
      const errors: any = {errors: []};

      // this.handleTitle(data);

      this.beforeSave$.next(errors);
      console.log('After validation:', data);
      const formInvalid = errors.errors.filter((err: any) => err.invalid)[0];
      if (formInvalid && formInvalid.invalid) {
        this.modalService.showJavascriptError('Der Datensatz kann nicht veröffentlicht werden.');
        return;
      }

      this.dataService.publish(data)
        .subscribe(json => {
            const info = this.mapToDocumentAbstracts([json], json._parent)[0];

            this.afterSave$.next(data);
            this.datasetsChanged$.next({
              type: UpdateType.Update,
              data: [info]
            });
            this.treeStore.upsert(info.id, info);
            resolve();
          }
          // , err => this.errorService.handle( err )
        );
    });
  }

  delete(ids: string[]): void {
    this.dataService.delete(ids)
      .subscribe(res => {
        console.log('ok', res);
        const data = ids.map(id => {
          return {id: id};
        });
        // @ts-ignore
        this.datasetsChanged$.next({type: UpdateType.Delete, data: data});
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

}
