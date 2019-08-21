import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {NgForm} from '@angular/forms';

interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'ige-table-type',
  template: `
    <table mat-table editable [dataSource]="dataSource">

      <ng-container *ngFor="let column of displayedColumns; let i = index" [matColumnDef]="column">
        <mat-header-cell *matHeaderCellDef> {{to.columns[i].label}} </mat-header-cell>
        <mat-cell *matCellDef="let element" [matPopoverEdit]="nameEdit" matPopoverEditTabOut matEditOpen>
          {{element[column]}}
          <!-- This edit is defined in the cell and can implicitly access element -->
          <ng-template #nameEdit>
            <form #f="ngForm"
                  matEditLens
                  matEditLensClickOutBehavior="submit"
                  (ngSubmit)="onSubmitName(element, f)"
                  [matEditLensPreservedFormValue]="preservedValues[column].get(element)"
                  (matEditLensPreservedFormValueChange)="preservedValues[column].set(element, $event)">
              <div mat-edit-content>
                <mat-form-field class="full-width">
                  <input matInput [ngModel]="element[column]" name="name" required>
                </mat-form-field>
              </div>
            </form>
          </ng-template>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>

    </table>
  `,
  styles: [`
      table, .full-width {
          width: 100%;
      }

      ::ng-deep .mat-form-field-appearance-legacy .mat-form-field-infix:first-of-type {
          padding: 0 0 0 24px;
      }
      ::ng-deep .mat-form-field-appearance-legacy .mat-form-field-infix {
          padding: 0;
      }

      ::ng-deep .mat-form-field-appearance-legacy .mat-form-field-wrapper {
          padding-bottom: 0;
      }
  `]
})
export class TableTypeComponent extends FieldType implements OnInit, AfterViewInit {

  ELEMENT_DATA: PeriodicElement[] = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'}
  ];

  readonly preservedValues = {};

  dataSource = this.ELEMENT_DATA;
  displayedColumns: string[];

  ngOnInit() {
    this.displayedColumns = this.to.columns.map(column => column.key);
    this.displayedColumns.forEach(column => this.preservedValues[column] = new WeakMap<PeriodicElement, any>());
  }

  ngAfterViewInit() {
  }

  onSubmitName(element: PeriodicElement, f: NgForm) {
    if (!f.valid) {
      return;
    }

    element.name = f.value.name;
  }

}
