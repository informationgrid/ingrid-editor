import { Injectable } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { ConfigService, Configuration } from '../config.service';
import { UpdateType } from '../../models/update-type.enum';
import { DocMainInfo, UpdateDatasetInfo } from '../../models/update-dataset-info.model';
import { ErrorService } from '../error.service';
import { KeycloakService } from '../../security/keycloak/keycloak.service';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/internal/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

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

  titleFields: string;
  private configuration: Configuration;

  constructor(private http: HttpClient, private modalService: ModalService,
              configService: ConfigService,
              private errorService: ErrorService) {
    if (KeycloakService.auth.loggedIn) {
      // TODO: this.titleFields = this.formularService.getFieldsNeededForTitle().join( ',' );
    }

    setTimeout(() => {
      configService.promiseProfilePackageLoaded.then(() => {
        this.titleFields = configService.getTitleFields().join(',');
      });
    }, 0);
    this.configuration = configService.getConfiguration();
  }

  findDocuments(query: string) {
    // TODO: use general sort filter
    return this.http.get<any[]>(
      this.configuration.backendUrl + 'datasets?query=' + query + '&sort=title&fields=_id,_profile,_state,' + this.titleFields )
      .pipe(
        map( json => {
          return json.filter( item => item && item._profile !== 'FOLDER' );
        } )
        // catchError( err => this.errorService.handleOwn( 'Could not query documents', err ) )
      );
  }

  getChildDocuments(parentId: string): Observable<any> {
    const fields = 'fields=_id,_profile,_state,_hasChildren,' + this.titleFields;
    const idQuery = parentId === null ? '' : '&parentId=' + parentId;
    // headers.append('Content-Type', 'text/plain');
    return this.http.get( this.configuration.backendUrl + 'datasets?children=true&' + fields + idQuery )
      .pipe(
        // catchError( (err) => this.errorService.handle( err ) )
      );
  }

  loadData(id: string): Observable<DocMainInfo> {
    return this.http.get<DocMainInfo>( this.configuration.backendUrl + 'datasets/' + id );
  }

  saveData(data: any, isNewDoc?: boolean): Promise<DocMainInfo> {
    console.log( 'TEST: save data' );
    // let errors: any = {errors: []};
    // this.beforeSave.next(errors);
    // console.log('After validation:', errors);
    return new Promise( (resolve, reject) => {
      let response = null;
      if (data._id) {
        response = this.http.put( this.configuration.backendUrl + 'datasets/' + data._id, data );

      } else {
        response = this.http.post( this.configuration.backendUrl + 'datasets', data );

      }
      // response.catch( (err) => this.errorService.handle( err ) );

      console.log( 'Response:', response );
      response.subscribe( json => {
        data._id = json._id;
        data._state = json._state;
        this.afterSave.next( data );
        this.datasetsChanged.next( {
          type: isNewDoc ? UpdateType.New : UpdateType.Update,
          data: [data]
        } );
        resolve( data );
      }, err => {
        reject( err );
      } );
    } );
  }

  // FIXME: this should be added with a plugin
  publish(data: any) {
    console.log( 'PUBLISHING' );
    const errors: any = {errors: []};
    this.beforeSave.next( errors );
    console.log( 'After validation:', data );
    const formInvalid = errors.errors.filter( (err: any) => err.invalid )[0];
    if (formInvalid && formInvalid.invalid) {
      this.modalService.showJavascriptError( 'Der Datensatz kann nicht veröffentlicht werden.' );
      return;
    }
    let response = null;

    if (data._id === undefined) {
      response = this.http.post( this.configuration.backendUrl + 'datasets?publish=true', data );

    } else {
      response = this.http.put( this.configuration.backendUrl + 'datasets/' + data._id + '?publish=true', data );

    }

    // response.catch( err => this.errorService.handle( err ) );

    console.log( 'Response:', response );
    response.subscribe( json => {
      data._id = json._id;
      data._state = json._state;
      this.afterSave.next( data );
      this.datasetsChanged.next( {type: UpdateType.Update, data: [data]} );
    }
    // , err => this.errorService.handle( err )
    );
  }

  delete(ids: string[]): any {
    const response = this.http.delete( this.configuration.backendUrl + 'datasets/' + ids, {responseType: 'text'} );
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
    return this.http.put( this.configuration.backendUrl + 'datasets/' + id + '?revert=true', {} )
      .pipe(
        tap( (json: any) => this.datasetsChanged.next( {type: UpdateType.Update, data: [json]} ) )
        // catchError( err => this.errorService.handle( err ) )
      );

    // return response.subscribe(res => {
    //   console.log( 'ok, res' );
    //   this.datasetsChanged.next();
    // });
  }

  getPathToDataset(id: string): Observable<string[]> {
    return this.http.get<string[]>( this.configuration.backendUrl + 'datasets/' + id + '/path' );
      // .pipe( catchError( err => this.errorService.handle( err ) ) );
  }

  /**
   * Copy a set of documents under a specified destination document.
   * @param copiedDatasets contains the IDs of the documents to be copied
   * @param dest is the document, where the other docs to be copied will have as their parent
   * @param includeTree, if set to tree then the whole tree is being copied instead of just the selected document
   * @returns {Observable<Response>}
   */
  copyDocuments(srcIDs: string[], dest: string, includeTree: boolean) {
    const body = this.prepareCopyCutBody( dest, includeTree );
    return this.http.post( this.configuration.backendUrl + 'datasets/' + srcIDs.join( ',' ) + '/copy', body );
  }

  /**
   * Move a set of documents under a specified destination document.
   * @param src contains the IDs of the documents to be moved
   * @param dest is the document, where the other docs to be copied will have as their parent
   * @param includeTree, if set to tree then the whole tree is being copied instead of just the selected document
   * @returns {Observable<Response>}
   */
  moveDocuments(srcIDs: string[], dest: string, includeTree: boolean) {
    const body = this.prepareCopyCutBody( dest, includeTree );
    return this.http.post( this.configuration.backendUrl + 'datasets/' + srcIDs.join( ',' ) + '/move', body );
  }

  private prepareCopyCutBody(dest: string, includeTree: boolean): any {
    const body = {
      // srcIds: src,
      destId: dest
    };
    return body;
  }
}
