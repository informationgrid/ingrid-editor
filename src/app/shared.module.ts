import { NgModule } from '@angular/core';
import { MetadataTreeComponent } from './+form/sidebars/tree/tree.component';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
import { TreeModule } from 'primeng/primeng';
import { FocusDirective } from './directives/focus.directive';
import { FormFieldsModule } from './form-fields/form-fields.module';
import { DropDownComponent } from './form-fields/drop-down/drop-down.component';
import { DataGridComponent } from './form-fields/data-grid/data-grid.component';
import { DateboxComponent } from './form-fields/datebox/datebox.component';
import { CheckboxComponent } from './form-fields/checkbox/checkbox.component';
import { RadioboxComponent } from './form-fields/radiobox/radiobox.component';

@NgModule({
  imports: [CommonModule, TreeModule, AngularSplitModule, FormFieldsModule],
  declarations: [MetadataTreeComponent],
  exports: [MetadataTreeComponent, AngularSplitModule,
    FocusDirective,
    DropDownComponent, DataGridComponent, DateboxComponent, CheckboxComponent, RadioboxComponent
  ]
})
export class SharedModule {
}
