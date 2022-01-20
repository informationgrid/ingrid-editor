import { AfterViewInit, Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter, tap } from "rxjs/operators";
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
import { LinkDialogComponent } from "./link-dialog/link-dialog.component";
import {
  LinkInfo,
  UploadFilesDialogComponent,
} from "./upload-files-dialog/upload-files-dialog.component";
import { UploadService } from "../../../shared/upload/upload.service";

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
  formattedCell: Array<any> = [];

  private profile: string;
  private docType: string;
  private fieldId: string;

  constructor(
    private dialog: MatDialog,
    public contextHelpService: ContextHelpService,
    public configService: ConfigService,
    private uploadService: UploadService
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
      .pipe(
        untilDestroyed(this),
        // distinctUntilChanged(),
        tap((value) => this.prepareFormattedValues(value))
      )
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

  removeRow(index: number) {
    this.removeFileInBackend(index);
    this.dataSource = new MatTableDataSource<any>(
      this.dataSource.data.filter((item, indexItem) => indexItem !== index)
    );
    this.updateFormControl(this.dataSource.data);
  }

  private removeFileInBackend(index: number) {
    const link = this.dataSource.data[index].link;
    if (link.asLink) {
      const docUuid = this.form.get("_id").value;
      this.uploadService.deleteUploadedFile(docUuid, link.uri);
    }
  }

  editRow(index: number) {
    const newEntry = index === null;
    this.dialog
      .open(FormDialogComponent, {
        hasBackdrop: true,
        minWidth: 400,
        data: {
          fields: this.to.columns,
          model: newEntry
            ? {}
            : JSON.parse(JSON.stringify(this.dataSource.data[index])),
          document: this.model,
          newEntry: newEntry,
        } as FormDialogData,
      })
      .afterClosed()
      .subscribe((result) => {
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

  drop(event: CdkDragDrop<any, any>) {
    moveItemInArray(
      this.dataSource.data,
      event.previousIndex,
      event.currentIndex
    );
    this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
  }

  private prepareFormattedValues(value: any[]) {
    this.formattedCell = [];

    if (value === null) {
      return;
    }

    this.to.columns
      .filter((column) => column.templateOptions.formatter)
      .forEach((column) =>
        value?.forEach((row, index) => {
          this.formattedCell.push({});
          this.formattedCell[index][column.key] =
            column.templateOptions.formatter(
              value[index][column.key],
              this.form
            );
        })
      );
  }

  showUploadFilesDialog() {
    this.dialog
      .open(UploadFilesDialogComponent, {
        minWidth: 700,
        data: {
          currentItems: this.dataSource.data,
        },
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((files: LinkInfo[]) => this.updateTableInformation(files));
  }

  private updateTableInformation(files: LinkInfo[]) {
    files
      .filter((file) => this.isNotInTable(file))
      .forEach((file) => this.addToDatasource(file));

    this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
    this.updateFormControl(this.dataSource.data);
  }

  private addToDatasource(file: LinkInfo) {
    this.dataSource.data.push({
      title: file.file,
      link: { asLink: false, value: file.file, uri: file.uri },
    });
  }

  private isNotInTable(file: LinkInfo) {
    return (
      this.dataSource.data.findIndex(
        (tableItem) => !tableItem.link.asLink && tableItem.link.uri === file.uri
      ) === -1
    );
  }

  showAddLinkDialog() {
    this.dialog
      .open(LinkDialogComponent, { maxWidth: 600 })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((result) => {
        this.dataSource.data.push({
          title: result.title,
          link: { asLink: true, value: result.url, uri: result.url },
        });
        this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
        this.updateFormControl(this.dataSource.data);
      });
  }

  update() {
    this.value = this.formControl.value;
  }

  cancel() {
    this.formControl.setValue(this.value);
  }

  handleCellClick(index: number, element, $event: MouseEvent) {
    if (!element.link.asLink) {
      const options =
        this.to.columns[this.batchMode ? index - 1 : index].templateOptions;
      if (options.onClick) {
        options.onClick(this.form.get("_id").value, element.link.uri, $event);
      }
    }
  }
}
