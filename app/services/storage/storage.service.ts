import { Injectable } from '@angular/core';
import {FormToolbarService} from '../../+form/toolbar/form-toolbar.service';

export interface DocumentInterface {
  id: string;

}

@Injectable()
export class StorageService {

  constructor() {
  }

  load(id: string) {
    return new Promise( (resolve, reject) => {
      let data = {};
      if (id === '0') {
        data = Object.assign( {}, {
          mainInfo: {
            taskId: '1234567',
            title: 'Meine erste UVP',
            description: 'Hier ist eine Beschreibung.'
          },
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
          ]
        } );
      } else if (id === '1') {
        data = Object.assign( {}, {
          mainInfo: {
            taskId: '98765',
            title: 'Meine zweite UVP',
            description: 'Noch eine Beschreibung.'
          },
          categories: []
        } );
      }
      setTimeout( () => resolve( data ) );
    } );
  }

  save(document: DocumentInterface) {
    console.log( 'DEMO: save document' );
  }


  // FIXME: this should be added with a plugin
  publish() {

  }

}