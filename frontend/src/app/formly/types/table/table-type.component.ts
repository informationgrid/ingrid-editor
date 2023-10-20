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
import { ValidUntilDialogComponent } from "./valid-until-dialog/valid-until-dialog.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { FieldTypeConfig } from "@ngx-formly/core";
import { ValidationErrors } from "@angular/forms";

@UntilDestroy()
@Component({
  selector: "ige-table-type",
  templateUrl: "table-type.component.html",
  styleUrls: ["table-type.component.scss"],
})
export class TableTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit, AfterViewInit
{
  readonly preservedValues = {};

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[];
  displayedColumnsReadOnly: string[];
  selection = new SelectionModel<any>(true, []);
  batchMode = false;
  dragDisabled = true;
  formattedCell: Array<any> = [];

  private profile: string;
  private docType: string;
  private fieldId: string;

  constructor(
    private dialog: MatDialog,
    public contextHelpService: ContextHelpService,
    public configService: ConfigService,
  ) {
    super();
  }

  ngOnInit() {
    this.displayedColumns = this.props.columns
      .filter((column) => !column.hidden)
      .map((column) => column.key);
    this.displayedColumns.push("_actions_");
    this.displayedColumns.forEach(
      (column) => (this.preservedValues[column] = new WeakMap<any, any>()),
    );
    this.displayedColumnsReadOnly = this.displayedColumns.slice(0, -1);

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        // distinctUntilChanged(),
        tap((value) => this.prepareFormattedValues(value)),
      )
      .subscribe(
        (value) => (this.dataSource = new MatTableDataSource<any>(value || [])),
      );

    const requiredColumnKeys = this.props.columns
      .filter((col) => col.props.required)
      .map((col) => col.key);
    if (requiredColumnKeys.length > 0) {
      this.formControl.addValidators((): ValidationErrors | null => {
        return !this.formControl.value ||
          this.formControl.value.length === 0 ||
          requiredColumnKeys.length === 0 ||
          this.hasRequiredFields(requiredColumnKeys)
          ? null
          : {
              requiredColumns: {
                message: "Es sind nicht alle Pflichtspalten ausgefüllt",
              },
            };
      });
    }

    // init with formatted values
    this.prepareFormattedValues(this.formControl.value);

    this.dataSource = new MatTableDataSource<any>(this.formControl.value || []);
  }

  ngAfterViewInit() {
    this.profile = this.configService.$userInfo.getValue().currentCatalog.type;
    this.docType = this.props.docType ?? this.model?._type;
    this.fieldId = <string>this.field.key;
  }

  showContextHelp(infoElement: HTMLElement) {
    this.contextHelpService.showContextHelp(
      this.profile,
      this.docType,
      this.fieldId,
      this.props.externalLabel,
      infoElement,
    );
  }

  removeRow(index: number) {
    this.selection.deselect(this.dataSource.data[index]);

    this.dataSource = new MatTableDataSource<any>(
      this.dataSource.data.filter((item, indexItem) => indexItem !== index),
    );
    this.updateFormControl(this.dataSource.data);

    if (this.dataSource.data.length === 0) {
      this.toggleBatchMode(false);
    }
  }

  editRow(index: number) {
    const newEntry = index === null;
    this.dialog
      .open(this.props.dialog ?? FormDialogComponent, {
        hasBackdrop: true,
        minWidth: 600,
        data: {
          fields: this.props.columns.filter((column) => !column.hidden),
          model: newEntry
            ? {}
            : JSON.parse(JSON.stringify(this.dataSource.data[index])),
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
          this.updateTableDataToForm(this.dataSource.data);
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

  toggleBatchMode(forceState?: boolean) {
    this.batchMode = forceState ?? !this.batchMode;

    if (this.batchMode) {
      this.displayedColumns.unshift("_select_");
    } else {
      this.displayedColumns = this.displayedColumns.filter(
        (item) => item !== "_select_",
      );
    }
  }

  removeSelectedRows() {
    const updated = this.dataSource.data.filter(
      (row) => !this.selection.selected.includes(row),
    );
    this.updateTableDataToForm(updated);

    this.selection.clear();

    if (updated.length === 0) {
      this.toggleBatchMode(false);
    }
  }

  showDeleteEntriesDialog() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          message: `Möchten Sie die Einträge wirklich löschen?`,
          title: "Löschen",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Löschen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .subscribe((response) => {
        if (response === "confirm") {
          this.removeSelectedRows();
        }
      });
  }

  drop(event: CdkDragDrop<any, any>) {
    moveItemInArray(
      this.dataSource.data,
      event.previousIndex,
      event.currentIndex,
    );
    this.updateTableDataToForm(this.dataSource.data);
  }

  private prepareFormattedValues(value: any[]) {
    this.formattedCell = [];

    if (value === null) {
      return;
    }

    this.props.columns
      .filter((column) => column.props.formatter)
      .forEach(
        (column) =>
          value?.forEach((row, index) => {
            this.formattedCell.push({});
            this.formattedCell[index][column.key] = column.props.formatter(
              value[index][column.key],
              this.form,
              value[index],
            );
          }),
      );
  }

  showUploadFilesDialog() {
    this.dialog
      .open(UploadFilesDialogComponent, {
        minWidth: 700,
        data: {
          currentItems: this.dataSource.data,
          uploadFieldKey: this.getUploadFieldKey(),
          hasExtractZipOption: true,
        },
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((files: LinkInfo[]) =>
        this.updateTableInformationWithUploadInfo(files),
      );
  }

  private updateTableInformationWithUploadInfo(files: LinkInfo[]) {
    files
      .filter((file) => this.isNotInTable(file))
      .forEach((file) => this.addUploadInfoToDatasource(file));

    this.updateTableDataToForm(this.dataSource.data);
  }

  private getUploadFieldKey(): string {
    return this.props.columns.find((column) => column.type === "upload")?.key;
  }

  private addUploadInfoToDatasource(file: LinkInfo) {
    const newRow = {
      title: this.prepareTitleFromFile(file.file),
    };
    newRow[this.getUploadFieldKey()] = {
      asLink: false,
      value: file.file,
      uri: file.uri,
    };
    this.dataSource.data.push(newRow);
  }

  private addLinkInfoToDatasource(link: any) {
    this.dataSource.data.push(link);
  }

  private isNotInTable(file: LinkInfo) {
    const uploadKey = this.getUploadFieldKey();
    return (
      this.dataSource.data.findIndex(
        (tableItem) =>
          !tableItem[uploadKey].asLink && tableItem[uploadKey].uri === file.uri,
      ) === -1
    );
  }

  showAddLinkDialog() {
    this.dialog
      .open(LinkDialogComponent, {
        maxWidth: 600,
        hasBackdrop: true,
        data: {
          fields: this.props.columns,
          model: {},
          newEntry: true,
        } as FormDialogData,
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((result) => {
        this.addLinkInfoToDatasource(result);
        this.updateTableDataToForm(this.dataSource.data);
      });
  }

  private updateTableDataToForm(data: any[]) {
    this.dataSource = new MatTableDataSource<any>(data);
    this.updateFormControl(data);
  }

  update() {
    this.value = this.formControl.value;
  }

  cancel() {
    this.formControl.setValue(this.value);
  }

  handleCellClick(index: number, element, $event: MouseEvent) {
    if (!this.props.supportUpload) return;

    const uploadKey = this.getUploadFieldKey();
    if (!element[uploadKey].asLink) {
      const options =
        this.props.columns[this.batchMode ? index - 1 : index].props;
      if (options.onClick) {
        options.onClick(
          this.form.root.get("_uuid").value,
          element[uploadKey].uri,
          $event,
        );
      }
    }
  }

  setValidUntil() {
    this.dialog
      .open(ValidUntilDialogComponent)
      .afterClosed()
      .pipe(filter((result) => result !== undefined))
      .subscribe((date) => {
        const dateObj = date === null ? null : new Date(date);
        this.selection.selected.forEach((row) => (row.validUntil = dateObj));
        this.updateTableDataToForm(this.dataSource.data);
      });
  }

  private prepareTitleFromFile(file: string) {
    const lastDotPos = file.lastIndexOf(".");
    const name = file.substring(
      0,
      lastDotPos === -1 ? file.length : lastDotPos,
    );
    return decodeURI(name);
  }

  private hasRequiredFields(requiredColumnKeys: string[]): boolean {
    return this.formControl.value?.every((item) =>
      requiredColumnKeys.every((key) => item[key]),
    );
  }
}
