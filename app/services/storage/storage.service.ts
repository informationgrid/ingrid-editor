import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {Headers, RequestOptions} from '@angular/http';
import {ModalService} from '../modal/modal.service';
import {FormularService} from '../formular/formular.service';
import {ConfigService} from '../../config/config.service';
import {UpdateType} from '../../models/update-type.enum';
import {UpdateDatasetInfo} from '../../models/update-dataset-info.model';
import {AuthService} from '../security/auth.service';
import {Router} from '@angular/router';
import {ErrorService} from '../error.service';
import {AuthHttp} from 'angular2-jwt';

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

  constructor(private http: AuthHttp, private modalService: ModalService, private formularService: FormularService,
              private configService: ConfigService, private authenticationService: AuthService,
              private errorService: ErrorService, private router: Router) {
    this.titleFields = this.formularService.getFieldsNeededForTitle().join(',');
  }

  _createRequestOptions(): RequestOptions {
    let headers = new Headers(); // { 'Authorization': 'Bearer ' + this.authenticationService.token });
    headers.append('Authorization', 'Bearer ' + this.authenticationService.token);
    return new RequestOptions({ headers: headers });

  }

  findDocuments(query: string) {
    return this.http.get(
      this.configService.backendUrl + 'datasets/find?query=' + query + '&sort=mainInfo.title&fields=_id,_profile,_state,' + this.titleFields,
      this._createRequestOptions())
      .map(resp => {
        let json = <any[]>resp.json();
        return json.filter(item => item._profile !== 'FOLDER');
      })
      .catch(err => this.errorService.handle(err));
  }

  getChildDocuments(parentId: string): Observable<any> {
    let idQuery = parentId === null ? '' : '&parentId=' + parentId;
    // headers.append('Content-Type', 'text/plain');
    return this.http.get(this.configService.backendUrl + 'datasets/children?fields=_id,_profile,_state,hasChildren,' + this.titleFields + idQuery,
      this._createRequestOptions())
      .map(resp => resp.json())
      .catch((err) => this.errorService.handle(err));
  }

  loadData(id: string): Observable<any> {
    return this.http.get(this.configService.backendUrl + 'dataset/' + id)
      .map(resp => resp.json());
  }

  saveData(data: any): Promise<any> {
    console.log('TEST: save data');
    let previousId = data._id ? data._id : '-1';
    // let errors: any = {errors: []};
    // this.beforeSave.next(errors);
    // console.log('After validation:', errors);
    return new Promise((resolve, reject) => {
      let response = this.http.post(this.configService.backendUrl + 'dataset/1', data, this._createRequestOptions())
        .catch((err) => this.errorService.handle(err));
      console.log('Response:', response);
      response.subscribe(res => {
        console.log('received:', res);
        data._previousId = previousId;
        data._id = res.json()._id;
        data._state = res.json()._state;
        this.afterSave.next(data);
        this.datasetsChanged.next({type: UpdateType.Update, data: data});
        resolve(data);
      }, err => {
        reject(err);
      });
    });
  }

  // FIXME: this should be added with a plugin
  publish(data: any) {
    console.log('PUBLISHING');
    let previousId = data._id ? data._id : '-1';
    let errors: any = {errors: []};
    this.beforeSave.next(errors);
    console.log('After validation:', data);
    let formInvalid = errors.errors.filter( (err: any) => err.invalid)[0];
    if (formInvalid && formInvalid.invalid) {
      this.modalService.showError('Der Datensatz kann nicht veröffentlicht werden.');
      return;
    }
    let response = this.http.post(this.configService.backendUrl + 'dataset/1?publish=true', data)
      .catch(err => this.errorService.handle(err));

    console.log('Response:', response);
    response.subscribe(res => {
      console.log('received:', res);
      data._previousId = previousId;
      data._id = res.json()._id;
      data._state = res.json()._state;
      this.afterSave.next(data);
      this.datasetsChanged.next({type: UpdateType.Update, data: data});
    }, err => this.errorService.handle(err));
  }

  delete(id: string): any {
    let response = this.http.delete(this.configService.backendUrl + 'dataset/' + id)
      .catch(err => this.errorService.handle(err));

    response.subscribe(res => {
      console.log( 'ok', res );
      this.datasetsChanged.next({type: UpdateType.Delete, data: {_id: id}});
    });
  }

  revert(id: string): Observable<any> {
    console.debug('REVERTING', id);
    return this.http.post(this.configService.backendUrl + 'dataset/' + id + '?revert=true', null)
      .do( (res: any) => this.datasetsChanged.next({type: UpdateType.Update, data: res.json()}) )
      .catch(err => this.errorService.handle(err));

    // return response.subscribe(res => {
    //   console.log( 'ok, res' );
    //   this.datasetsChanged.next();
    // });
  }

  getPathToDataset(id: string): Observable<string[]> {
    return this.http.get(this.configService.backendUrl + 'dataset/path/' + id)
      .map(resp => resp.json())
      .catch(err => this.errorService.handle(err));
  }

  /**
   * Copy a set of documents under a specified destination document.
   * @param copiedDatasets contains the IDs of the documents to be copied
   * @param dest is the document, where the other docs to be copied will have as their parent
   * @param includeTree, if set to tree then the whole tree is being copied instead of just the selected document
   * @returns {Observable<Response>}
   */
  copyDocuments(copiedDatasets: string[], dest: string, includeTree: boolean) {
    let body = this.prepareCopyCutBody(copiedDatasets, dest, includeTree);
    return this.http.post(this.configService.backendUrl + 'datasets/copy', body);
  }

  /**
   * Move a set of documents under a specified destination document.
   * @param src contains the IDs of the documents to be moved
   * @param dest is the document, where the other docs to be copied will have as their parent
   * @param includeTree, if set to tree then the whole tree is being copied instead of just the selected document
   * @returns {Observable<Response>}
   */
  moveDocuments(src: string[], dest: string, includeTree: boolean) {
    let body = this.prepareCopyCutBody(src, dest, includeTree);
    return this.http.post(this.configService.backendUrl + 'datasets/move', body);
  }

  private prepareCopyCutBody(src: string[], dest: string, includeTree: boolean): any {
    let body = {
      srcIds: src,
      destId: dest
    };
    return body;
  }
}