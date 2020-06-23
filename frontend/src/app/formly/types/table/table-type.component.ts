import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {distinctUntilChanged} from 'rxjs/operators';
import {AddressRef} from '../address-type/address-card/address-card.component';
import {MatDialog} from '@angular/material/dialog';
import {FormDialogComponent, FormDialogData} from './form-dialog/form-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';

@UntilDestroy()
@Component({
  selector: 'ige-table-type',
  templateUrl: 'table-type.component.html',
  styleUrls: ['table-type.component.scss']
})
export class TableTypeComponent extends FieldType implements OnInit, AfterViewInit {

  readonly preservedValues = {};

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[];
  selection = new SelectionModel<any>(true, []);
  batchMode = false;


  constructor(private dialog: MatDialog) {
    super();
  }

  ngOnInit() {
    this.displayedColumns = this.to.columns.map(column => column.key);
    this.displayedColumns.push('_actions_');
    this.displayedColumns.forEach(column => this.preservedValues[column] = new WeakMap<any, any>());

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged()
      )
      .subscribe(value => this.dataSource = new MatTableDataSource<any>(value || []));

    this.dataSource = new MatTableDataSource<any>(this.formControl.value || []);

  }

  ngAfterViewInit() {
  }


  addRow() {
    this.dataSource = new MatTableDataSource<any>([...this.dataSource.data, {}]);
    // this.dataSource.data.push({});
    this.updateFormControl(this.dataSource.data);
  }

  removeRow(index: number) {

    this.dataSource = new MatTableDataSource<any>(
      this.dataSource.data.filter((item, indexItem) => indexItem !== index ));
    this.updateFormControl(this.dataSource.data);

  }

  editRow(index: number) {

    this.dialog.open(FormDialogComponent, {
      data: {
        fields: this.to.columns,
        model: this.dataSource.data[index]
      } as FormDialogData,
    }).afterClosed()
      .subscribe(result => {
        console.log(result);
        if (result) {
          this.dataSource.data.splice(index, 1, result);
          this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
          this.updateFormControl(this.dataSource.data);
        }
      });

  }

  private updateFormControl(value: any[]) {
    this.formControl.setValue(value);
    this.formControl.markAsDirty();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  toggleBatchMode() {
    this.batchMode = !this.batchMode;

    if (this.batchMode) {
      this.displayedColumns.unshift('_select_')
    } else {
      this.displayedColumns = this.displayedColumns.filter( item => item !== '_select_')
    }
  }
}
