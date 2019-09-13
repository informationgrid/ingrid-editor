import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DropDownComponent} from './drop-down/drop-down.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DataGridComponent} from './data-grid/data-grid.component';
import {DateboxComponent} from './datebox/datebox.component';
import {CheckboxComponent} from './checkbox/checkbox.component';
import {RadioboxComponent} from './radiobox/radiobox.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NgxDatagridComponent } from './ngx-datagrid/ngx-datagrid.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatInputModule, MatDatepickerModule, MatNativeDateModule, MatCheckboxModule, MatRadioModule, MatTableModule, MatButtonModule,
    MatIconModule, MatSelectModule,
    NgxDatatableModule
  ],
  declarations: [DropDownComponent, DataGridComponent, DateboxComponent, CheckboxComponent, RadioboxComponent, NgxDatagridComponent],
  exports: [DropDownComponent, DataGridComponent, DateboxComponent, CheckboxComponent, RadioboxComponent, NgxDatagridComponent]
})
export class FormFieldsModule {
}
