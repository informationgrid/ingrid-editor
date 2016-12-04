import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {Http, Headers, RequestOptions} from '@angular/http';
import {ModalService} from '../modal/modal.service';
import {FormularService} from '../formular/formular.service';
import {ConfigService} from '../../config/config.service';
import {UpdateType} from '../../models/update-type.enum';
import {UpdateDatasetInfo} from '../../models/update-dataset-info.model';
import {AuthService} from '../security/auth.service';
import {Router} from '@angular/router';
import {ErrorService} from "../error.service";

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

  constructor(private http: Http, private modalService: ModalService, private formularService: FormularService,
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
      .map(resp => resp.json())
      .catch(err => this._handleError(err));
  }

  getChildDocuments(parentId: string): Observable<any> {
    let idQuery = parentId === null ? '' : '&parentId=' + parentId;
    // headers.append('Content-Type', 'text/plain');
    return this.http.get(this.configService.backendUrl + 'datasets/children?fields=_id,_profile,_state,hasChildren,' + this.titleFields + idQuery,
      this._createRequestOptions())
      .map(resp => resp.json())
      .catch((err) => this._handleError(err));
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
      .catch(this._handleError);
    console.log('Response:', response);
    response.subscribe(res => {
      console.log('received:', res);
      data._previousId = previousId;
      data._id = res.json()._id;
      data._state = res.json()._state;
      this.afterSave.next(data);
      this.datasetsChanged.next({type: UpdateType.Update, data: data});
    }, err => {
      console.error( 'error:', err );
    });
  }

  delete(id: string): any {
    let response = this.http.delete(this.configService.backendUrl + 'dataset/' + id)
      .catch(err => this._handleError(err));

    response.subscribe(res => {
      console.log( 'ok', res );
      this.datasetsChanged.next({type: UpdateType.Delete, data: {_id: id}});
    });
  }

  revert(id: string): Observable<any> {
    console.debug('REVERTING', id);
    return this.http.post(this.configService.backendUrl + 'dataset/' + id + '?revert=true', null)
      .do( (res: any) => this.datasetsChanged.next({type: UpdateType.Update, data: res.json()}) )
      .catch(this._handleError);

    // return response.subscribe(res => {
    //   console.log( 'ok, res' );
    //   this.datasetsChanged.next();
    // });
  }

  getPathToDataset(id: string): Observable<string[]> {
    return this.http.get(this.configService.backendUrl + 'dataset/path/' + id)
      .map(resp => resp.json())
      .catch(this._handleError);
  }

  _handleError(err: any) {
    // on logout or jwt expired
    if (err.status === 403) {
      console.log('Not logged in');
      this.router.navigate(['/login']);
    } else {
      console.error('Error: ', err);
      this.modalService.showError(err);
      return Observable.throw(err);
    }
  }
}