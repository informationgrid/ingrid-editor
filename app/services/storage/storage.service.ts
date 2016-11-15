import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {Http} from '@angular/http';
import {ModalService} from '../modal/modal.service';
import {FormularService} from '../formular/formular.service';
import {ConfigService} from '../../config/config.service';
import {UpdateType} from '../../models/update-type.enum';
import {UpdateDatasetInfo} from '../../models/update-dataset-info.model';

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

  constructor(private http: Http, private modalService: ModalService, private formularService: FormularService, private configService: ConfigService) {
    this.titleFields = this.formularService.getFieldsNeededForTitle().join(',');
  }

  findDocuments(query: string) {
    return this.http.get(this.configService.backendUrl + 'datasets/find?query=' + query + '&fields=_id,_profile,_state,' + this.titleFields)
      .map(resp => resp.json());
  }

  getChildDocuments(parentId: string): Observable<any> {
    let idQuery = parentId === null ? '' : '&parentId=' + parentId;
    return this.http.get(this.configService.backendUrl + 'datasets/children?&fields=_id,_profile,_state,hasChildren,' + this.titleFields + idQuery)
      .map(resp => resp.json());
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
      let response = this.http.post(this.configService.backendUrl + 'dataset/1', data)
        .catch(this._handleError);
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
      console.log( 'ok, res' );
      this.datasetsChanged.next({type: UpdateType.Delete, data: {_id: id}});
    });
  }

  revert(id: string): Observable<any> {
    console.debug('REVERTING', id);
    return this.http.post(this.configService.backendUrl + 'dataset/' + id + '?revert=true', null)
      .do( (res) => this.datasetsChanged.next({type: UpdateType.Update, data: res.json()}) )
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
    console.error('Error: ', err);
    this.modalService.showError(err);
    return Observable.throw(err);
  }
}