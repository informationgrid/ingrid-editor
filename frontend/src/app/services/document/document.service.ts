import {Injectable} from '@angular/core';
import {ModalService} from '../modal/modal.service';
import {UpdateType} from '../../models/update-type.enum';
import {DocMainInfo, UpdateDatasetInfo} from '../../models/update-dataset-info.model';
import {KeycloakService} from '../../security/keycloak/keycloak.service';
import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/internal/operators';
import {IgeDocument} from "../../models/ige-document";
import {DocumentDataService} from "./document-data.service";
import {DocumentStore} from "../../store/document/document.store";
import {DocumentAbstract} from "../../store/document/document.model";
import {TreeStore} from "../../store/tree/tree.store";
import {createTreeNode} from "../../store/tree/tree-node.model";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  beforeSave: Subject<any> = new Subject<any>();
  afterSave: Subject<any> = new Subject<any>();
  afterLoadAndSet: Subject<any> = new Subject<any>();
  afterProfileSwitch: Subject<any> = new Subject<any>();
  datasetsChanged: Subject<UpdateDatasetInfo> = new Subject<UpdateDatasetInfo>();

  beforeLoad = new Subject<void>();

  afterLoadAndSet$ = this.afterLoadAndSet.asObservable();
  afterProfileSwitch$ = this.afterProfileSwitch.asObservable();
  datasetsChanged$ = this.datasetsChanged.asObservable();
  beforeSave$ = this.beforeSave.asObservable();

  constructor(private modalService: ModalService,
              private dataService: DocumentDataService,
              private documentStore: DocumentStore,
              private treeStore: TreeStore) {
    if (KeycloakService.auth.loggedIn) {
      // TODO: this.titleFields = this.formularService.getFieldsNeededForTitle().join( ',' );
    }
  }

  find(query: string): void {
    // TODO: use general sort filter
    this.dataService.find(query)
      .pipe(
        map(json => {
          return json.filter(item => item && item._profile !== 'FOLDER');
        }),
        tap(docs => {
          this.documentStore.set(this.mapToDocuments(docs));
        })
        // catchError( err => this.errorService.handleOwn( 'Could not query documents', err ) )
      ).subscribe();
  }

  findRecent(): void {
    // TODO: use general sort filter
    this.dataService.find(null)
      .pipe(
        map(json => {
          return json.filter(item => item && item._profile !== 'FOLDER');
        }),
        tap(docs => {
          this.documentStore.setRecent(this.mapToDocuments(docs));
        })
        // catchError( err => this.errorService.handleOwn( 'Could not query documents', err ) )
      ).subscribe();
  }

  private mapToDocuments(docs: any[]): DocumentAbstract[] {
    return docs.map(doc => this.mapToDocument(doc));
  }

  private mapToDocument(doc: any): DocumentAbstract {
    return {
      id: doc._id,
      title: doc.title,
      icon: "",
      _id: doc._id,
      _profile: doc._profile,
      _state: doc._state,
      // _children: doc._children,
      _hasChildren: doc._hasChildren
    };
  }

  getChildren(parentId: string): Observable<DocumentAbstract[]> {
    return this.dataService.getChildren(parentId)
      .pipe(
        //tap( docs => this.documentStore.set(docs))
        map(docs => {
          return docs.map(doc => {
            let childTreeNode: DocumentAbstract = {
              _id: doc._id,
              icon: null,
              id: doc._id,
              // TODO: get title from document, but circular dependency with formularservice
              title: doc.title, // this.formularService.getTitle( doc._profile, doc ); // doc.title,
              _state: doc._state,
              _hasChildren: doc._hasChildren,
              // parent: parentId,
              _profile: doc._profile,
            };
            return childTreeNode;
          })
        }),
        tap(docs => {
          if (parentId === null) {
            this.treeStore.set(docs);
          } else {
            //let entity = Object.assign({}, this.treeQuery.getEntity(parentId));
            //entity.children = docs;
            //this.treeStore.update(parentId, entity);
            this.treeStore.add(docs);
          }
        })
      );
  }

  load(id: string): Observable<IgeDocument> {
    return this.dataService.load(id).pipe(
      tap(doc => this.documentStore.setOpenedDocument(doc))
    );
  }

  save(data: IgeDocument, isNewDoc?: boolean): Promise<IgeDocument> {
    return new Promise((resolve, reject) => {
      this.dataService.save(data)
        .subscribe(json => {
          let info: DocMainInfo = {
            _id: json._id,
            _state: json._state
          };

          this.afterSave.next(data);
          this.datasetsChanged.next({
            type: isNewDoc ? UpdateType.New : UpdateType.Update,
            data: [info]
          });
          resolve(data);
        }, err => {
          reject(err);
        });
    });
  }

  // FIXME: this should be added with a plugin
  publish(data: IgeDocument) {
    console.log('PUBLISHING');
    const errors: any = {errors: []};
    this.beforeSave.next(errors);
    console.log('After validation:', data);
    const formInvalid = errors.errors.filter((err: any) => err.invalid)[0];
    if (formInvalid && formInvalid.invalid) {
      this.modalService.showJavascriptError('Der Datensatz kann nicht veröffentlicht werden.');
      return;
    }

    this.dataService.publish(data)
      .subscribe(json => {
          let info: DocMainInfo = {
            _id: json._id,
            _state: json._state
          };
          this.afterSave.next(data);
          this.datasetsChanged.next({type: UpdateType.Update, data: [info]});
        }
        // , err => this.errorService.handle( err )
      );
  }

  delete(ids: string[]): any {
    const response = this.dataService.delete(ids);
    // .pipe( catchError( err => this.errorService.handle( err ) ) );

    response.subscribe(res => {
      console.log('ok', res);
      const data = ids.map(id => {
        return {_id: id};
      });
      this.datasetsChanged.next({type: UpdateType.Delete, data: data});
    });
  }

  revert(id: string): Observable<any> {
    return this.dataService.revert(id)
      .pipe(
        tap((json: any) => this.datasetsChanged.next({type: UpdateType.Update, data: [json]}))
        // catchError( err => this.errorService.handle( err ) )
      );
  }

  getPath(id: string): Observable<string[]> {
    return this.dataService.getPath(id);
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


}
