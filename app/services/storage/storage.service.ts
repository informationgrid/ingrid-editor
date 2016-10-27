import {Injectable} from "@angular/core";
import {Subject, Observable, Subscription} from "rxjs";
import {Http} from "@angular/http";
import {ModalService} from "../modal/modal.service";
import {FormularService} from "../formular/formular.service";

export interface DocumentInterface {
  id: string;

}

interface FormFields {
  _profile: string;
}

const serviceUrl = 'http://localhost:8080/v1/';

@Injectable()
export class StorageService {


  beforeSave: Subject<any> = new Subject<any>();
  afterSave: Subject<any> = new Subject<any>();
  afterLoadAndSet: Subject<any> = new Subject<any>();
  afterProfileSwitch: Subject<any> = new Subject<any>();
  datasetsChanged: Subject<any> = new Subject<any>();

  afterLoadAndSet$ = this.afterLoadAndSet.asObservable();
  afterProfileSwitch$ = this.afterProfileSwitch.asObservable();

  titleFields: string;

  constructor(private http: Http, private modalService: ModalService, private formularService: FormularService) {
    this.titleFields = this.formularService.getFieldsNeededForTitle().join(',');
  }

  findDocuments(query: string) {
    return this.http.get(serviceUrl + 'datasets/find?query=' + query + '&fields=_id,_profile,_state,' + this.titleFields)
      .map(resp => resp.json());
  }

  getChildDocuments(parentId: string): Observable<any> {
    let idQuery = parentId === null ? '' : '&parentId=' + parentId;
    return this.http.get(serviceUrl + 'datasets/children?&fields=_id,_profile,_state,hasChildren,' + this.titleFields + idQuery)
      .map(resp => resp.json());
  }

  loadData(id: string): Observable<any> {
    return this.http.get(serviceUrl + 'dataset/' + id)
      .map(resp => resp.json());
  }

  saveData(data: any): Promise<any> {
    console.log('TEST: save data');
    // let errors: any = {errors: []};
    // this.beforeSave.next(errors);
    // console.log('After validation:', errors);
    return new Promise((resolve, reject) => {
      let response = this.http.post(serviceUrl + 'dataset/1', data)
        .catch(this._handleError);
      console.log('Response:', response);
      response.subscribe(res => {
        console.log('received:', res);
        data._id = res.json()._id;
        this.afterSave.next(data);
        this.datasetsChanged.next();
        resolve(data);
      }, err => {
        reject(err);
      });
    });
  }

  // FIXME: this should be added with a plugin
  publish(data: any) {
    console.log('PUBLISHING');
    let errors: any = {errors: []};
    this.beforeSave.next(errors);
    console.log('After validation:', data);
    let formInvalid = errors.errors.filter( (err: any) => err.invalid)[0];
    if (formInvalid && formInvalid.invalid) {
      this.modalService.showError('Der Datensatz kann nicht veröffentlicht werden.');
      return;
    }
    let response = this.http.post(serviceUrl + 'dataset/1?publish=true', data)
      .catch(this._handleError);
    console.log('Response:', response);
    response.subscribe(res => {
      console.log('received:', res);
      data._id = res.json()._id;
      this.afterSave.next(data);
      this.datasetsChanged.next();
    }, err => {
      console.error( 'error:', err );
    });
  }

  delete(id: string): any {
    let response = this.http.delete(serviceUrl + 'dataset/' + id)
      .catch(this._handleError);

    response.subscribe(res => {
      console.log( 'ok, res' );
      this.datasetsChanged.next();
    });
  }

  revert(id: string): Observable<any> {
    console.log('REVERTING');
    return this.http.post(serviceUrl + 'dataset/' + id + '?revert=true', null)
      .do( () => this.datasetsChanged.next() )
      .catch(this._handleError);

    // return response.subscribe(res => {
    //   console.log( 'ok, res' );
    //   this.datasetsChanged.next();
    // });
  }

  _handleError(err: any) {
    console.error('Error: ', err);
    return Observable.throw(err);
  }
}