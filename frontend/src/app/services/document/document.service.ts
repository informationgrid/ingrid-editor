import {Injectable} from '@angular/core';
import {ModalService} from '../modal/modal.service';
import {UpdateType} from '../../models/update-type.enum';
import {DocMainInfo, UpdateDatasetInfo} from '../../models/update-dataset-info.model';
import {ErrorService} from '../error.service';
import {KeycloakService} from '../../security/keycloak/keycloak.service';
import {Observable, Subject} from 'rxjs';
import {map, tap} from 'rxjs/internal/operators';
import {IgeDocument} from "../../models/ige-document";
import {DocumentDataService} from "./document-data.service";
import {DocumentStore} from "../../store/document/document.store";
import {DocumentQuery} from "../../store/document/document.query";

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
              private documentQuery: DocumentQuery,
              private errorService: ErrorService) {
    if (KeycloakService.auth.loggedIn) {
      // TODO: this.titleFields = this.formularService.getFieldsNeededForTitle().join( ',' );
    }
  }

  find(query: string): Observable<IgeDocument[]> {
    // TODO: use general sort filter
    return this.dataService.find(query)
      .pipe(
        map( json => {
          return json.filter( item => item && item._profile !== 'FOLDER' );
        } )
        // catchError( err => this.errorService.handleOwn( 'Could not query documents', err ) )
      );
  }

  getChildren(parentId: string): Observable<any> {
    return this.dataService.getChildren(parentId)
      .pipe(
        //tap( docs => this.documentStore.set(docs))
        tap( docs => {
          if (parentId === null) {
            this.documentStore.set(docs);
          } else {
            let entity = Object.assign({}, this.documentQuery.getEntity(parentId));
            entity._children = docs;
            this.documentStore.update(parentId, entity);
          }
        })
      );
  }

  load(id: string): Observable<DocMainInfo> {
    return this.dataService.load(id);
  }

  save(data: IgeDocument, isNewDoc?: boolean): Promise<IgeDocument> {
    return new Promise( (resolve, reject) => {
      this.dataService.save(data)
        .subscribe( json => {
          let info: DocMainInfo = {
            _id: json._id,
            _state: json._state
          };

          this.afterSave.next( data );
          this.datasetsChanged.next( {
            type: isNewDoc ? UpdateType.New : UpdateType.Update,
            data: [info]
          } );
          resolve( data );
        }, err => {
          reject( err );
        } );
    } );
  }

  // FIXME: this should be added with a plugin
  publish(data: IgeDocument) {
    console.log( 'PUBLISHING' );
    const errors: any = {errors: []};
    this.beforeSave.next( errors );
    console.log( 'After validation:', data );
    const formInvalid = errors.errors.filter( (err: any) => err.invalid )[0];
    if (formInvalid && formInvalid.invalid) {
      this.modalService.showJavascriptError( 'Der Datensatz kann nicht veröffentlicht werden.' );
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

    response.subscribe( res => {
      console.log( 'ok', res );
      const data = ids.map( id => {
        return {_id: id};
      } );
      this.datasetsChanged.next( {type: UpdateType.Delete, data: data} );
    } );
  }

  revert(id: string): Observable<any> {
    return this.dataService.revert(id)
      .pipe(
        tap( (json: any) => this.datasetsChanged.next( {type: UpdateType.Update, data: [json]} ) )
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
