import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropDownComponent } from './drop-down/drop-down.component';
import { CalendarModule, CheckboxModule, DropdownModule, RadioButtonModule } from 'primeng/primeng';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataGridComponent } from './data-grid/data-grid.component';
import { DataGridModule } from './data-grid/data-grid.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FocusDirective } from '../directives/focus.directive';
import { DateboxComponent } from './datebox/datebox.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { RadioboxComponent } from './radiobox/radiobox.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, Ng2SmartTableModule,
    DropdownModule, CalendarModule, DataGridModule, CheckboxModule, RadioButtonModule
  ],
  declarations: [FocusDirective, DropDownComponent, DataGridComponent, DateboxComponent, CheckboxComponent, RadioboxComponent],
  exports: [FocusDirective, DropDownComponent, DataGridComponent, DateboxComponent, CheckboxComponent, RadioboxComponent]
})
export class FormFieldsModule { }
