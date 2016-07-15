import { Injectable }       from '@angular/core';

import {FieldBase} from "../controls/field-base";
import {TextareaField} from "../controls/field-textarea";
import {DropdownField} from "../controls/field-dropdown";
import {TextboxField} from "../controls/field-textbox";
import {Container} from "../controls/container";
import {EventEmitter} from "@angular/core";
import {TableField} from "../controls/field-table";

@Injectable()
export class FormularService {

  data = {};

  onBeforeSave: EventEmitter = new EventEmitter();

  // Todo: get from a remote source of question metadata
  // Todo: make asynchronous
  getFields() {

    var data = {
      brave: {
        type: "DropDown"

      }
    };

    let questions: FieldBase<any>[] = [

      /*new DropdownField({
        key: 'brave',
        label: 'Bravery Rating',
        options: [
          {key: 'solid',  value: 'Solid'},
          {key: 'great',  value: 'Great'},
          {key: 'good',   value: 'Good'},
          {key: 'unproven', value: 'Unproven'}
        ],
        order: 4
      }),*/

      new Container({
        useGroupKey: 'mainInfo',
        domClass: 'half',
        children: [
          new TextboxField({
            key: 'taskId',
            label: 'Vorhabensnummer',
            // domClass: 'half',
            order: 1
          }),

          new TextboxField({
            key: 'title',
            label: 'Titel',
            // domClass: 'half',
            order: 10
          }),

          new TextareaField({
            key: 'description',
            label: 'Beschreibung',
            // domClass: 'half',
            rows: 10,
            order: 20
          }),
        ]
      }),

      new TextareaField({
        key: 'map',
        label: 'Karte',
        domClass: 'half',
        rows: 17,
        order: 5
      }),

      new TableField({
        key: 'categories',
        label: 'Kategorien',
        order: 30
      })

    ];

    return questions.sort((a, b) => a.order - b.order);
  }

  getLoadedData() {
    return this.data;
  }

  loadData(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let data = {};
      if (id === '0') {
        data = Object.assign( {}, {
          mainInfo: {
            taskId: "1234567",
            title: "Meine erste UVP",
            description: "Hier ist eine Beschreibung."
          },
          categories: [
            {
              vin: '1234',
              year: 1985,
              brand: 'BMW',
              color: 'white'
            },{
              vin: '343',
              year: 1981,
              brand: 'Opel',
              color: 'black'
            },{
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
            taskId: "98765",
            title: "Meine zweite UVP",
            description: "Noch eine Beschreibung."
          },
          categories: []
        } );
      }
      setTimeout(()=> resolve(data));
    });
  }
}
