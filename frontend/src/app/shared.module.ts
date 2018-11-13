import {NgModule} from '@angular/core';
import {MetadataTreeComponent} from './+form/sidebars/tree/tree.component';
import {CommonModule} from '@angular/common';
import {FocusDirective} from './directives/focus.directive';
import {FormFieldsModule} from './form-fields/form-fields.module';
import {DropDownComponent} from './form-fields/drop-down/drop-down.component';
import {DataGridComponent} from './form-fields/data-grid/data-grid.component';
import {DateboxComponent} from './form-fields/datebox/datebox.component';
import {CheckboxComponent} from './form-fields/checkbox/checkbox.component';
import {RadioboxComponent} from './form-fields/radiobox/radiobox.component';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatExpansionModule,
  MatIconModule,
  MatListModule,
  MatProgressBarModule,
  MatSelectModule,
  MatTreeModule
} from '@angular/material';
import {AngularSplitModule} from "angular-split";

@NgModule({
  imports: [CommonModule,
    MatTreeModule, MatIconModule, MatProgressBarModule, MatButtonModule, MatExpansionModule, MatCheckboxModule, MatListModule,
    MatSelectModule,
    AngularSplitModule,
    FormFieldsModule],
  declarations: [MetadataTreeComponent],
  exports: [MetadataTreeComponent, AngularSplitModule, MatExpansionModule, MatCheckboxModule, MatListModule, MatSelectModule,
    FocusDirective,
    DropDownComponent, DataGridComponent, DateboxComponent, CheckboxComponent, RadioboxComponent
  ]
})
export class SharedModule {
}
