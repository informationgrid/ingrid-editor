import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {ColumnMode, SelectionType} from '@swimlane/ngx-datatable';

@Component({
  selector: 'ige-field-datatable',
  template: `
    <div [formGroup]="form">
      <ige-ngx-datagrid [formControlName]="field.key" [columns]="to.columns"></ige-ngx-datagrid>
    </div>
  `
})
export class NgxDatatableTypeComponent extends FieldType implements OnInit, AfterViewInit {
  // @ViewChild('defaultColumn', {static: true}) public defaultColumn: TemplateRef<any>;

  selected = [];

  rowIndex = 0;

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  editing = {};
  rows = [
    {
      'name': 'Ethel Price',
      'gender': 'female',
      'company': 'Johnson, Johnson and Partners, LLC CMP DDC',
      'age': 22
    },
    {
      'name': 'Claudine Neal',
      'gender': 'female',
      'company': 'Sealoud',
      'age': 55
    },
    {
      'name': 'Beryl Rice',
      'gender': 'female',
      'company': 'Velity',
      'age': 67
    },
    {
      'name': 'Wilder Gonzales',
      'gender': 'male',
      'company': 'Geekko'
    }];

  ngOnInit() {
    // this.to.columns.forEach(column => column.cellTemplate = this.defaultColumn);
    /*const groupCols = {};
    // @ts-ignore
    this.to.columns.forEach(col => {
      groupCols[col.key] = new FormControl();
    });
    const tableGroup = new FormGroup(groupCols);
    this.form.addControl(this.field.key, new FormArray([tableGroup]));
    this.form.get('addresses').setValue([{name: 'unknown'}])*/
  }

  /*getField(field: FormlyFieldConfig, column: TableColumn, rowIndex: number): FormlyFieldConfig {
    return field.fieldGroup[rowIndex].fieldGroup.find(f => f.key === column.prop);
  }*/

}
