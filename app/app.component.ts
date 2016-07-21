import {Component} from '@angular/core';
import {DynamicFormComponent} from './form/dynamic-form.component';
import {FormularService} from './services/formular/formular.service';
import {BehavioursDefault} from './services/behaviour/behaviours';

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
