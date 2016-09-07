import {Injectable} from '@angular/core';
import {FieldBase} from '../../+form/controls/field-base';
import {Subject} from 'rxjs';
import {profile as UVP_profile} from './uvp/uvp.profile';
import {profile as ISO_profile} from './iso/iso.profile';

interface FormFields {
  _profile: string;
}

@Injectable()
export class FormularService {

  data = {};

  beforeSave: Subject<any> = new Subject<any>();

  currentProfile: string;

  // Todo: get from a remote source of question metadata
  // Todo: make asynchronous
  getFields(profile: string) {

    // TODO: choose correct profile for data to be displayed
    let fields: FieldBase<any>[];

    if (profile === 'UVP') fields = UVP_profile;
    else if (profile === 'ISO') fields = ISO_profile;

    this.currentProfile = profile;

    // return a copy of our fields (immutable data!)
    return fields.sort( (a, b) => a.order - b.order ).slice( 0 );
  }

  /*getLoadedData() {
    return this.data;
  }*/

  getNewDocument(profile: string) {
    return {};
  }

  loadData(id: string): Promise<any> {
    return new Promise( (resolve, reject) => {
      let data: FormFields = {_profile: 'UVP'};
      if (id === '0') {
        data = Object.assign( {}, {
          _profile: 'UVP',
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
      }
      setTimeout( () => {
        resolve( data );
      } );
    } );
  }

  saveData() {
    console.log( 'TEST: save data' );
  }
}
