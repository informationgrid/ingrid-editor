import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BehavioursComponent} from './behaviours.component';
import {routing} from './behaviours.routing';
import {SharedModule} from '../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {FormFieldsModule} from '../form-fields/form-fields.module';
import {FormlyModule} from '@ngx-formly/core';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {MatCardModule} from '@angular/material/card';

@NgModule({
    imports: [
        routing, CommonModule, FormsModule, ReactiveFormsModule, SharedModule, MatTabsModule,
        FormlyMaterialModule, FormlyModule.forChild(),
        MatButtonModule, MatInputModule, MatCheckboxModule, FormFieldsModule, FormlyModule, MatCardModule],
  declarations: [
    BehavioursComponent
  ],
  entryComponents: []
})
export class BehavioursModule {
}
