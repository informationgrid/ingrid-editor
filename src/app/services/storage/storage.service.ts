import {Injectable} from '@angular/core';
import {ModalService} from '../modal/modal.service';
import {FormularService} from '../formular/formular.service';
import { ConfigService, Configuration } from '../../config/config.service';
import {UpdateType} from '../../models/update-type.enum';
import {DocMainInfo, UpdateDatasetInfo} from '../../models/update-dataset-info.model';
import {ErrorService} from '../error.service';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Http} from '@angular/http';
import {KeycloakService} from '../../keycloak/keycloak.service';

@Injectable()
export class StorageService {

  beforeSave: Subject<any> = new Subject<any>();
  afterSave: Subject<any> = new Subject<any>();
  afterLoadAndSet: Subject<any> = new Subject<any>();
  afterProfileSwitch: Subject<any> = new Subject<any>();
  datasetsChanged: Subject<UpdateDatasetInfo> = new Subject<UpdateDatasetInfo>();

  afterLoadAndSet$ = this.afterLoadAndSet.asObservable();
  afterProfileSwitch$ = this.afterProfileSwitch.asObservable();
  datasetsChanged$ = this.datasetsChanged.asObservable();
  beforeSave$ = this.beforeSave.asObservable();

  titleFields: string;
  private configuration: Configuration;

  constructor(private http: Http, private modalService: ModalService, private formularService: FormularService,
              configService: ConfigService,
              private errorService: ErrorService) {
    if (KeycloakService.auth.loggedIn) {
      this.titleFields = this.formularService.getFieldsNeededForTitle().join( ',' );
    }
    this.configuration = configService.getConfiguration();
  }

  findDocuments(query: string) {
    // TODO: use general sort filter
    return this.http.get(
      this.configuration.backendUrl + 'datasets?query=' + query + '&sort=title&fields=_id,_profile,_state,' + this.titleFields )
      .map( resp => {
        const json = <any[]>resp.json();
        return json.filter( item => item._profile !== 'FOLDER' );
      } )
      .catch( err => this.errorService.handle( err ) );
  }

  getChildDocuments(parentId: string): Observable<any> {
    const fields = 'fields=_id,_profile,_state,_hasChildren,' + this.titleFields;
    const idQuery = parentId === null ? '' : '&parentId=' + parentId;
    // headers.append('Content-Type', 'text/plain');
    return this.http.get( this.configuration.backendUrl + 'datasets?children=true&' + fields + idQuery )
      .map( resp => resp.json() )
      .catch( (err) => this.errorService.handle( err ) );
  }

  loadData(id: string): Observable<DocMainInfo> {
    return this.http.get( this.configuration.backendUrl + 'datasets/' + id )
      .map( resp => resp.json() );
  }

  saveData(data: any, isNewDoc?: boolean): Promise<DocMainInfo> {
    console.log( 'TEST: save data' );
    const previousId = data._id ? data._id : '-1';
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
      response.catch( (err) => this.errorService.handle( err ) );

      console.log( 'Response:', response );
      response.subscribe( res => {
        console.log( 'received:', res );
        data._previousId = previousId;
        data._id = res.json()._id;
        data._state = res.json()._state;
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
    const previousId = data._id ? data._id : '-1';
    const errors: any = {errors: []};
    this.beforeSave.next( errors );
    console.log( 'After validation:', data );
    const formInvalid = errors.errors.filter( (err: any) => err.invalid )[0];
    if (formInvalid && formInvalid.invalid) {
      this.modalService.showError( 'Der Datensatz kann nicht veröffentlicht werden.' );
      return;
    }
    let response = null;

    if (data._id === undefined) {
      response = this.http.post( this.configuration.backendUrl + 'datasets?publish=true', data );

    } else {
      response = this.http.put( this.configuration.backendUrl + 'datasets/' + data._id + '?publish=true', data );

    }

    response.catch( err => this.errorService.handle( err ) );

    console.log( 'Response:', response );
    response.subscribe( res => {
      console.log( 'received:', res );
      data._previousId = previousId;
      data._id = res.json()._id;
      data._state = res.json()._state;
      this.afterSave.next( data );
      this.datasetsChanged.next( {type: UpdateType.Update, data: [data]} );
    }, err => this.errorService.handle( err ) );
  }

  delete(ids: string[]): any {
    const response = this.http.delete( this.configuration.backendUrl + 'datasets/' + ids )
      .catch( err => this.errorService.handle( err ) );

    response.subscribe( res => {
      console.log( 'ok', res );
      const data = ids.map( id => {
        return {_id: id};
      } );
      this.datasetsChanged.next( {type: UpdateType.Delete, data: data} );
    } );
  }

  revert(id: string): Observable<any> {
    console.debug( 'REVERTING', id );
    return this.http.put( this.configuration.backendUrl + 'datasets/' + id + '?revert=true', {} )
      .do( (res: any) => this.datasetsChanged.next( {type: UpdateType.Update, data: [res.json()]} ) )
      .catch( err => this.errorService.handle( err ) );

    // return response.subscribe(res => {
    //   console.log( 'ok, res' );
    //   this.datasetsChanged.next();
    // });
  }

  getPathToDataset(id: string): Observable<string[]> {
    return this.http.get( this.configuration.backendUrl + 'datasets/' + id + '/path' )
      .map( resp => resp.json() )
      .catch( err => this.errorService.handle( err ) );
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
    return this.http.post( this.configuration.backendUrl + 'datasets/' + srcIDs.join(',') + '/copy', body );
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
    return this.http.post( this.configuration.backendUrl + 'datasets/' + srcIDs.join(',') + 'move', body );
  }

  private prepareCopyCutBody(dest: string, includeTree: boolean): any {
    const body = {
      // srcIds: src,
      destId: dest
    };
    return body;
  }
}
