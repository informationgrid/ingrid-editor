import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BehavioursComponent} from './behaviours.component';
import {routing} from './behaviours.routing';
import {Collapse} from '../directives/collapse.directive';
import {SharedModule} from '../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterModule, Routes} from '@angular/router';
import {FormFieldsModule} from '../form-fields/form-fields.module';
import {StatisticComponent} from './system/statistic/statistic.component';
import {CreateDocRulesPlugin} from './system/CreateRules/create-rules.behaviour';

@NgModule({
  imports: [
    routing, CommonModule, FormsModule, ReactiveFormsModule, SharedModule,
    MatCardModule, MatTabsModule, MatDialogModule,
    MatButtonModule, MatInputModule, MatCheckboxModule, FormFieldsModule],
  declarations: [
    BehavioursComponent, Collapse,
    StatisticComponent
  ],
  entryComponents: []
})
export class BehavioursModule {
}
