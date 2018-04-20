import { NgModule } from '@angular/core';
import { MetadataTreeComponent } from './+form/sidebars/tree/tree.component';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
import { TreeModule } from 'primeng/tree';
import { FocusDirective } from './directives/focus.directive';
import { FormFieldsModule } from './form-fields/form-fields.module';
import { DropDownComponent } from './form-fields/drop-down/drop-down.component';
import { DataGridComponent } from './form-fields/data-grid/data-grid.component';
import { DateboxComponent } from './form-fields/datebox/datebox.component';
import { CheckboxComponent } from './form-fields/checkbox/checkbox.component';
import { RadioboxComponent } from './form-fields/radiobox/radiobox.component';
import {
  MatButtonModule, MatCheckboxModule,
  MatExpansionModule,
  MatIconModule,
  MatProgressBarModule,
  MatTreeModule
} from '@angular/material';

@NgModule({
  imports: [CommonModule, TreeModule,
    MatTreeModule, MatIconModule, MatProgressBarModule, MatButtonModule, MatExpansionModule, MatCheckboxModule,
    AngularSplitModule,
    FormFieldsModule],
  declarations: [MetadataTreeComponent],
  exports: [MetadataTreeComponent, AngularSplitModule, MatExpansionModule, MatCheckboxModule,
    FocusDirective,
    DropDownComponent, DataGridComponent, DateboxComponent, CheckboxComponent, RadioboxComponent
  ]
})
export class SharedModule {
}
