import { Injectable }       from '@angular/core';

import {FieldBase} from "../controls/field-base";
import {TextareaField} from "../controls/field-textarea";
import {DropdownField} from "../controls/field-dropdown";
import {TextboxField} from "../controls/field-textbox";
import {Container} from "../controls/container";

@Injectable()
export class FormularService {

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
        rows: 20,
        order: 5
      }),

      new TextboxField({
        key: 'categories',
        label: 'Kategorien',
        order: 10
      })

    ];

    return questions.sort((a, b) => a.order - b.order);
  }
}
