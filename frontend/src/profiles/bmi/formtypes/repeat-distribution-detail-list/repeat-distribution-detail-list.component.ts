import { Component, OnInit } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import {
  FormDialogComponent,
  FormDialogData,
} from "../../../../app/formly/types/table/form-dialog/form-dialog.component";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from "@angular/cdk/drag-drop";
import { MatListModule } from "@angular/material/list";
import { AsyncPipe, KeyValuePipe, NgForOf, NgIf } from "@angular/common";
import { SharedPipesModule } from "../../../../app/directives/shared-pipes.module";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { AddButtonModule } from "../../../../app/shared/add-button/add-button.module";
import { MatButtonModule } from "@angular/material/button";
import { FormErrorComponent } from "../../../../app/+form/form-shared/ige-form-error/form-error.component";
import {
  LinkInfo,
  UploadFilesDialogComponent,
} from "../../../../app/formly/types/table/upload-files-dialog/upload-files-dialog.component";
import { filter } from "rxjs/operators";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "ige-repeat-distribution-detail-list",
  templateUrl: "./repeat-distribution-detail-list.component.html",
  styleUrls: ["./repeat-distribution-detail-list.component.scss"],
  imports: [
    NgIf,
    NgForOf,
    AsyncPipe,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatExpansionModule,
    AddButtonModule,
    MatButtonModule,
    SharedPipesModule,
    FormErrorComponent,
    KeyValuePipe,
    MatTooltipModule,
  ],
  standalone: true,
})
export class RepeatDistributionDetailListComponent
  extends FieldArrayType
  implements OnInit
{
  showMore = {};
  batchMode = false;

  constructor(private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {}

  addItem() {
    this.openDialog(null);
  }

  editItem(index: number) {
    this.openDialog(index);
  }

  showUploadFilesDialog() {
    this.dialog
      .open(UploadFilesDialogComponent, {
        minWidth: 700,
        data: {
          currentItems: this.model,
          uploadFieldKey: this.getUploadFieldKey(),
          hasExtractZipOption: true,
          infoText: this.field.props.infoText,
        },
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((files: LinkInfo[]) =>
        this.updateTableInformationWithUploadInfo(files)
      );
  }

  private updateTableInformationWithUploadInfo(files: LinkInfo[]) {
    files
      .filter((file) => this.isNotInTable(file))
      .forEach((file) => this.addUploadInfoToDatasource(file));

    this.formControl.markAsDirty();
    //this.updateTableDataToForm(this.model);
  }

  private getUploadFieldKey(): string {
    return this.getFields(this.field.fieldArray).find(
      (field) => field.type === "upload"
    )?.key;
  }

  private getDownloadURL(uri: string) {
    return (
      this.field.props.backendUrl +
      "upload/" +
      this.form.get("_uuid").value +
      "/" +
      uri
    );
  }

  private getDateString(datetime: string): string {
    return new Date(datetime).toLocaleDateString();
  }

  private addUploadInfoToDatasource(file: LinkInfo) {
    const newRow = this.getEmptyEntry();
    newRow.title = "";
    newRow[this.getUploadFieldKey()] = {
      asLink: false,
      value: file.file,
      uri: file.uri,
      lastModified: new Date(),
    };
    this.add(null, newRow);
  }

  private getEmptyEntry() {
    const template = {
      format: { key: null },
      title: "",
      description: "",
      license: null,
      byClause: "",
      languages: [],
      plannedAvailability: null,
    };
    template[this.getUploadFieldKey()] = {
      asLink: true,
      value: "",
      uri: "",
    };
    return template;
  }

  private addLinkInfoToDatasource(link: any) {
    this.model.push(link);
  }

  private isNotInTable(file: LinkInfo) {
    const uploadKey = this.getUploadFieldKey();
    return (
      !this.model ||
      this.model?.findIndex(
        (item) => !item[uploadKey].asLink && item[uploadKey].uri === file.uri
      ) === -1
    );
  }

  private updateTableDataToForm(data: any[]) {
    //this.model = new MatTableDataSource<any>(data);
    this.updateFormControl(data);
  }

  private updateFormControl(value: any[]) {
    this.formControl.setValue(value);
    this.formControl.markAsDirty();
  }

  private getFields(props: any) {
    return props.fieldGroup[0].fieldGroup;
  }

  private openDialog(index?: number) {
    console.log(index);
    this.dialog
      .open(FormDialogComponent, {
        width: "90vw",
        maxWidth: "950px",
        disableClose: true,
        data: <FormDialogData>{
          fields: this.getFields(this.field.fieldArray),
          model:
            index === undefined
              ? this.getEmptyEntry()
              : JSON.parse(JSON.stringify(this.model[index])),
          formState: { mainModel: { _type: this.formState.mainModel?._type } },
        },
        delayFocusTrap: true,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          response.link.value = response.link.uri;
          if (index !== undefined) {
            this.remove(index);
          }
          this.add(index, response);
        }
      });
  }

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    const item = this.model[event.previousIndex];
    this.remove(event.previousIndex);
    this.add(event.currentIndex, item);
  }

  handleCellClick(index: number, element, $event: MouseEvent) {
    //if (!this.props.supportUpload) return;

    const uploadKey = this.getUploadFieldKey();
    if (!element.asLink) {
      const options = this.getFields(this.field.fieldArray)[2].props;
      if (options.onClick) {
        options.onClick(this.form.root.get("_uuid").value, element.uri, $event);
      }
    }
  }
}
