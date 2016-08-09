import {Injectable}       from '@angular/core';

import {FieldBase} from '../../form/controls/field-base';
import {TextareaField} from '../../form/controls/field-textarea';
import {TextboxField} from '../../form/controls/field-textbox';
import {Container} from '../../form/controls/container';
import {EventEmitter} from '@angular/core';
import {TableField} from '../../form/controls/field-table';
import {DropdownField} from '../../form/controls/field-dropdown';
import {CheckboxField} from '../../form/controls/field-checkbox';
import {RadioField} from '../../form/controls/field-radio';

@Injectable()
export class FormularService {

  data = {};

  onBeforeSave: EventEmitter<any> = new EventEmitter();

  // Todo: get from a remote source of question metadata
  // Todo: make asynchronous
  getFields() {

    let fields: FieldBase<any>[] = [

      new DropdownField( {
        key: 'brave',
        label: 'Bravery Rating',
        options: [
          {key: 'solid', value: 'Solid'},
          {key: 'great', value: 'Great'},
          {key: 'good', value: 'Good'},
          {key: 'unproven', value: 'Unproven'}
        ],
        order: 100
      } ),

      new Container( {
        useGroupKey: 'mainInfo',
        domClass: 'half',
        children: [
          new TextboxField( {
            key: 'taskId',
            label: 'Vorhabensnummer',
            // domClass: 'half',
            order: 1
          } ),

          new TextboxField( {
            key: 'title',
            label: 'Titel',
            // domClass: 'half',
            order: 10
          } ),

          new TextareaField( {
            key: 'description',
            label: 'Beschreibung',
            // domClass: 'half',
            rows: 10,
            order: 20
          } ),
        ]
      } ),

      new TextareaField( {
        key: 'map',
        label: 'Karte',
        domClass: 'half',
        rows: 17,
        order: 5
      } ),

      new TableField( {
        key: 'categories',
        label: 'Autos',
        columns: [
          {headerName: 'Vintage', field: 'vin', editable: true},
          {headerName: 'Jahr', field: 'year', editable: true},
          {headerName: 'Marke', field: 'brand'},
          {headerName: 'Farbe', field: 'color'}
        ],
        order: 30
      } ),

      new TextboxField( {
        key: 'date',
        label: 'Datum',
        domClass: 'half',
        order: 89,
        type: 'date'
      } ),

      new CheckboxField( {
        key: 'isOpenData',
        label: 'Open Data',
        domClass: 'half',
        order: 90
      } ),

      new RadioField( {
        key: 'gender',
        label: 'Gender',
        domClass: 'half',
        order: 91,
        options: [
          {label: 'male', value: 'm'},
          {label: 'female', value: 'f'}
        ]
      } )

    ];

    return fields.sort( (a, b) => a.order - b.order );
  }

  /*getLoadedData() {
    return this.data;
  }*/

  loadData(id: string): Promise<any> {
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
}
