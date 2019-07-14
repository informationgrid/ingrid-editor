import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DropDownComponent} from './drop-down/drop-down.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DataGridComponent} from './data-grid/data-grid.component';
import {DateboxComponent} from './datebox/datebox.component';
import {CheckboxComponent} from './checkbox/checkbox.component';
import {RadioboxComponent} from './radiobox/radiobox.component';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatRadioModule,
  MatSelectModule,
  MatTableModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatInputModule, MatDatepickerModule, MatNativeDateModule, MatCheckboxModule, MatRadioModule, MatTableModule, MatButtonModule,
    MatIconModule, MatSelectModule
  ],
  declarations: [DropDownComponent, DataGridComponent, DateboxComponent, CheckboxComponent, RadioboxComponent],
  exports: [DropDownComponent, DataGridComponent, DateboxComponent, CheckboxComponent, RadioboxComponent]
})
export class FormFieldsModule {
}
