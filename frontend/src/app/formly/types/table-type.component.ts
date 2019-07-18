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
      <ng-container matColumnDef="before">
        <mat-cell *matCellDef="let element" [matPopoverEdit]="nameEdit" matPopoverEditTabOut
                  matEditOpen>
          just a cell
          <!-- This edit is defined in the cell and can implicitly access element -->
          <ng-template #nameEdit>
            <div>
              <form #f="ngForm"
                    matEditLens
                    matEditLensClickOutBehavior="submit"
                    (ngSubmit)="onSubmitName(element, f)"
                    [matEditLensPreservedFormValue]="preservedNameValues.get(element)"
                    (matEditLensPreservedFormValueChange)="preservedNameValues.set(element, $event)">
                <div mat-edit-content>
                  <mat-form-field>
                    <input matInput [ngModel]="element.name" name="name" required>
                  </mat-form-field>
                </div>
              </form>
            </div>
          </ng-template>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="name">
        <mat-cell *matCellDef="let element">
          <ng-template #nameEdit>
          </ng-template>
          <span *matIfRowHovered>
            <button matEditOpen>Edit</button>
          </span>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="weight">
        <mat-cell *matCellDef="let element">
          {{element.weight}}
          <ng-template #weightEdit>
          </ng-template>
        </mat-cell>
      </ng-container>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </table>
  `,
  styles: [`
      table {
          width: 100%;
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

  readonly preservedNameValues = new WeakMap<PeriodicElement, any>();
  readonly preservedWeightValues = new WeakMap<PeriodicElement, any>();

  dataSource = this.ELEMENT_DATA;
  displayedColumns = ['before', 'name', 'weight'];

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  onSubmitName(element: PeriodicElement, f: NgForm) {
    if (!f.valid) { return; }

    element.name = f.value.name;
  }

}
