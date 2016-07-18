import { Component }       from '@angular/core';

import { DynamicFormComponent }     from './dynamic-form.component';
import {FormularService} from "./services/formular/formular.service";
import {BehavioursDefault} from "./services/behaviours";

@Component({
  selector: 'my-app',
  template: `
    <div>
      <h2>UVP</h2>
      <dynamic-form [fields]="fields"></dynamic-form>
    </div>
  `,
  directives: [DynamicFormComponent],
  providers:  [FormularService, BehavioursDefault]
})
export class AppComponent {
  fields: any[];

  constructor(service: FormularService) {
    this.fields = service.getFields();
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/