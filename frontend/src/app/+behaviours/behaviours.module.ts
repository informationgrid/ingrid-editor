import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PluginsComponent} from './behaviours.component';
import {routing} from './behaviours.routing';
import {Collapse} from '../directives/collapse.directive';
import {SharedModule} from '../shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatCheckboxModule, MatInputModule, MatTabsModule} from '@angular/material';
import {RouterModule, Routes} from "@angular/router";
import {FormFieldsModule} from "../form-fields/form-fields.module";

const routes: Routes = [
  {
    path: '',
    component: PluginsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule, FormsModule, ReactiveFormsModule, SharedModule, routing, MatCardModule, MatTabsModule,
  MatButtonModule, MatInputModule, MatCheckboxModule, FormFieldsModule],
  declarations: [
    PluginsComponent, Collapse
  ],
  entryComponents: [],
  exports: [RouterModule]
})
export class PluginsModule {
}
