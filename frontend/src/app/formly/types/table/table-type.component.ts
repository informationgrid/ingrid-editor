import { AfterViewInit, Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { distinctUntilChanged } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import {
  FormDialogComponent,
  FormDialogData,
} from "./form-dialog/form-dialog.component";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource } from "@angular/material/table";
import { ContextHelpService } from "../../../services/context-help/context-help.service";
import { ConfigService } from "../../../services/config/config.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@UntilDestroy()
@Component({
  selector: "ige-table-type",
  templateUrl: "table-type.component.html",
  styleUrls: ["table-type.component.scss"],
})
export class TableTypeComponent
  extends FieldType
  implements OnInit, AfterViewInit
{
  readonly preservedValues = {};

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[];
  displayedColumnsReadOnly: string[];
  selection = new SelectionModel<any>(true, []);
  batchMode = false;
  dragDisabled = false;

  private profile: string;
  private docType: string;
  private fieldId: string;

  constructor(
    private dialog: MatDialog,
    public contextHelpService: ContextHelpService,
    public configService: ConfigService
  ) {
    super();
  }

  ngOnInit() {
    this.displayedColumns = this.to.columns.map((column) => column.key);
    this.displayedColumns.push("_actions_");
    this.displayedColumns.forEach(
      (column) => (this.preservedValues[column] = new WeakMap<any, any>())
    );
    this.displayedColumnsReadOnly = this.displayedColumns.slice(0, -1);

    this.formControl.valueChanges
      .pipe(untilDestroyed(this), distinctUntilChanged())
      .subscribe(
        (value) => (this.dataSource = new MatTableDataSource<any>(value || []))
      );

    this.dataSource = new MatTableDataSource<any>(this.formControl.value || []);
  }

  ngAfterViewInit() {
    this.profile = this.configService.$userInfo.getValue().currentCatalog.type;
    this.docType = this.to.docType ?? this.model?._type;
    this.fieldId = <string>this.field.key;
  }

  showContextHelp(infoElement: HTMLElement) {
    this.contextHelpService.showContextHelp(
      this.profile,
      this.docType,
      this.fieldId,
      this.to.externalLabel,
      infoElement
    );
  }

  addRow() {
    this.editRow(null);
  }

  removeRow(index: number) {
    this.dataSource = new MatTableDataSource<any>(
      this.dataSource.data.filter((item, indexItem) => indexItem !== index)
    );
    this.updateFormControl(this.dataSource.data);
  }

  editRow(index: number) {
    const newEntry = index === null;
    this.dialog
      .open(FormDialogComponent, {
        data: {
          fields: this.to.columns,
          model: newEntry
            ? {}
            : JSON.parse(JSON.stringify(this.dataSource.data[index])),
          newEntry: newEntry,
        } as FormDialogData,
      })
      .afterClosed()
      .subscribe((result) => {
        console.log(result);
        if (result) {
          if (newEntry) {
            this.dataSource.data.push(result);
          } else {
            this.dataSource.data.splice(index, 1, result);
          }
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
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  toggleBatchMode() {
    this.batchMode = !this.batchMode;

    if (this.batchMode) {
      this.displayedColumns.unshift("_select_");
    } else {
      this.displayedColumns = this.displayedColumns.filter(
        (item) => item !== "_select_"
      );
    }
  }

  removeSelectedRows() {
    const updated = this.dataSource.data.filter(
      (row) => !this.selection.selected.includes(row)
    );
    this.dataSource = new MatTableDataSource<any>(updated);
    this.updateFormControl(this.dataSource.data);

    this.selection.clear();

    if (updated.length === 0) {
      this.batchMode = false;
    }
  }

  formatCell(column: any, text: string) {
    return column.templateOptions.formatter
      ? column.templateOptions.formatter(text)
      : text;
  }

  drop(event: CdkDragDrop<any, any>) {
    moveItemInArray(
      this.dataSource.data,
      event.previousIndex,
      event.currentIndex
    );
    this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
  }
}
