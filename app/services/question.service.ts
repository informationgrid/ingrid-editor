import { Injectable }       from '@angular/core';

import { DropdownQuestion } from '../controls/question-dropdown';
import { QuestionBase }     from '../controls/question-base';
import { TextboxQuestion }  from '../controls/question-textbox';

@Injectable()
export class QuestionService {

  // Todo: get from a remote source of question metadata
  // Todo: make asynchronous
  getQuestions() {

    var data = {
      brave: {
        type: "DropDown"

      }
    };

    let questions: QuestionBase<any>[] = [

      new DropdownQuestion({
        key: 'brave',
        label: 'Bravery Rating',
        options: [
          {key: 'solid',  value: 'Solid'},
          {key: 'great',  value: 'Great'},
          {key: 'good',   value: 'Good'},
          {key: 'unproven', value: 'Unproven'}
        ],
        order: 4
      }),

      new TextboxQuestion({
        key: 'firstName',
        label: 'First name',
        value: 'xxx',
        required: true,
        order: 1,
        domClass: 'warning'
      }),

      new TextboxQuestion({
        key: 'lastName',
        label: 'Last name',
        value: 'xxx',
        required: true,
        order: 2
      }),

      new TextboxQuestion({
        key: 'emailAddress',
        label: 'Email',
        type: 'email',
        validator: function(element) {
          if (element.value === 'e') return { invalidEmail: true, message: 'You should not enter "e"!' };
        },
        order: 3
      })
    ];

    return questions.sort((a, b) => a.order - b.order);
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/