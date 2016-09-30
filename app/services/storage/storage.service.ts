import {Injectable} from "@angular/core";
import {Subject, Observable} from "rxjs";
import {Http} from "@angular/http";

export interface DocumentInterface {
  id: string;

}

interface FormFields {
  _profile: string;
}

@Injectable()
export class StorageService {

  beforeSave: Subject<any> = new Subject<any>();
  afterSave: Subject<any> = new Subject<any>();

  constructor(private http: Http) {
  }

  findDocuments(query: string) {
    return this.http.get('http://localhost:8080/v1/datasets/find?query=' + query + '&fields=_id,_profile,mainInfo.title,title')
      .map(resp => resp.json());
  }

  loadData(id: string): Observable<any> {
    return this.http.get('http://localhost:8080/v1/dataset/' + id)
      .map(resp => resp.json());

    /*    return new Promise((resolve, reject) => {
     let data: FormFields = {_profile: 'UVP'};
     if (id === '0') {
     data = Object.assign({}, {
     _profile: 'UVP',
     mainInfo: {
     taskId: '1234567',
     title: 'Meine erste UVP',
     description: 'Hier ist eine Beschreibung.'
     },
     bbox: {x: 53.55, y: 9.99},
     brave: 'good',
     gender: 'm',
     date: '1978-10-10', // new Date(),
     isOpenData: true,
     isOpenData2: true,
     categories: [
     {
     vin: '1234',
     year: 1985,
     brand: 'BMW',
     color: 'white'
     }, {
     vin: '343',
     year: 1981,
     brand: 'Opel',
     color: 'black'
     }, {
     vin: '2352',
     year: 1989,
     brand: 'Audi',
     color: 'blue'
     }
     ],
     repeatableFields: [
     {
     repeat1: 'Text von Repeat 1',
     repeat2: 'Text von Repeat 2',
     repeatTable: [
     {
     type: 'PDF',
     url: 'http://xxx.de',
     date: '10.10.1978'
     }
     ]
     }, {
     repeat1: 'Text von Repeat 2-1',
     repeat2: 'Text von Repeat 2-2',
     repeatTable: [
     {
     type: 'XML',
     url: 'http://yyy.de',
     date: '13.06.1988'
     }
     ]
     }
     ]
     });
     } else if (id === '1') {
     data = Object.assign({}, {
     _profile: 'ISO',
     title: 'Meine erste ISO',
     description: 'Noch eine Beschreibung.'
     });
     } else if (id === '2') {
     data = Object.assign({}, {
     _profile: 'UVP',
     mainInfo: {
     taskId: '343424',
     title: 'Meine zweite UVP',
     description: 'Hier ist andere eine Beschreibung.'
     },
     bbox: {x: 50.11, y: 8.68},
     repeatableFields: [
     {
     repeat1: 'Other Text von Repeat 1',
     repeat2: 'Other Text von Repeat 2',
     repeatTable: [
     {
     type: 'XML',
     url: 'http://zzz.de',
     date: '10.11.2016'
     }
     ]
     }
     ]
     });
     }
     setTimeout(() => {
     resolve(data);
     });
     });*/
  }

  saveData(data: any) {
    console.log('TEST: save data');
    let errors: any = {errors: []};
    this.beforeSave.next(errors);
    console.log('After validation:', errors);
    let response = this.http.post('http://localhost:8080/v1/dataset/1', data)
      .catch((err: any) => {
        console.error('Error: ', err);
        return Observable.throw(err);
      });
    console.log('Response:', response);
    response.subscribe(res => console.log('received:', res));
    this.afterSave.next();
  }

  // FIXME: this should be added with a plugin
  publish() {
    console.log('PUBLISHING');
    let data: any = {errors: []};
    this.beforeSave.next(data);
    console.log('After validation:', data);
  }

  revert() {
    console.log('REVERTING');

  }
}