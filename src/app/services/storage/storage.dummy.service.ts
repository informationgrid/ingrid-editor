import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, Subject, throwError } from 'rxjs/index';
import { catchError } from 'rxjs/internal/operators';

export interface DocumentInterface {
  id: string;

}

interface FormFields {
  _profile: string;
}

@Injectable()
export class StorageDummyService {

  beforeSave: Subject<any> = new Subject<any>();
  afterSave: Subject<any> = new Subject<any>();

  constructor(private http: Http) {
  }

  findDocuments(query: string): Observable<any> {
    const subject = new Subject();
    setTimeout( () => {
      subject.next( [
        {'title': 'Meine erste UVP', '_id': '0', _profile: 'UVP'},
        {'title': 'Meine erste ISO', '_id': '1', _profile: 'ISO'},
        {'title': 'Meine zweite UVP', '_id': '2', _profile: 'UVP'}
      ] );
    } );

    return subject.asObservable();
  }

  loadData(id: string): Observable<any> {
    const subject = new Subject();

    let data: FormFields = {_profile: 'UVP'};
    if (id === '0') {
      data = Object.assign( {}, {
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
            category: 'BMW'
          }, {
            category: 'Opel'
          }, {
            category: 'Audi'
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
      } );
    } else if (id === '1') {
      data = Object.assign( {}, {
        _profile: 'ISO',
        title: 'Meine erste ISO',
        description: 'Noch eine Beschreibung.'
      } );
    } else if (id === '2') {
      data = Object.assign( {}, {
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
      } );
    }
    setTimeout( () => {
      subject.next( data );
    } );
    return subject.asObservable();
  }

  saveData(data: any) {
    console.log( 'TEST: save data' );
    const errors: any = {errors: []};
    this.beforeSave.next( errors );
    console.log( 'After validation:', errors );
    const response = this.http.post( 'http://localhost:8080/v1/dataset/1', data )
      .pipe(
        catchError( (err: any) => {
          console.error( 'Error: ', err );
          return throwError( err );
        } )
      );
    console.log( 'Response:', response );
    response.subscribe( res => console.log( 'received:', res ) );
    this.afterSave.next();
  }

  publish() {
    console.log( 'PUBLISHING' );
    const data: any = {errors: []};
    this.beforeSave.next( data );
    console.log( 'After validation:', data );
  }

  revert() {
    console.log( 'REVERTING' );

  }
}
