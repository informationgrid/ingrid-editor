/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, OnInit } from "@angular/core";
import {
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
} from "@ngx-formly/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import {
  FormDialogComponent,
  FormDialogData,
} from "../table/form-dialog/form-dialog.component";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from "@angular/cdk/drag-drop";
import { MatListModule } from "@angular/material/list";
import { AsyncPipe, JsonPipe, KeyValuePipe, NgForOf } from "@angular/common";
import { SharedPipesModule } from "../../../directives/shared-pipes.module";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { AddButtonModule } from "../../../shared/add-button/add-button.module";
import { MatButtonModule } from "@angular/material/button";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import {
  LinkInfo,
  UploadFilesDialogComponent,
} from "../table/upload-files-dialog/upload-files-dialog.component";
import { filter } from "rxjs/operators";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FieldType } from "@ngx-formly/material";
import { FormStateService } from "../../../+form/form-state.service";

interface RepeatDistributionDetailListProps extends FormlyFieldProps {
  supportLink?: boolean;
  supportUpload?: boolean;
  enableFileUploadOverride?: boolean;
  enableFileUploadReuse?: boolean;
  enableFileUploadRename?: boolean;
  jsonTemplate?: object,
  infoText: string;
  backendUrl: string;
  fields: FormlyFieldConfig[];
}

@Component({
  selector: "ige-repeat-distribution-detail-list",
  templateUrl: "./repeat-distribution-detail-list.component.html",
  styleUrls: ["./repeat-distribution-detail-list.component.scss"],
  imports: [
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
    JsonPipe,
    NgForOf,
  ],
  standalone: true,
})
export class RepeatDistributionDetailListComponent
  extends FieldType<FieldTypeConfig<RepeatDistributionDetailListProps>>
  implements OnInit
{
  showMore = {};
  batchMode = false;

  constructor(
    private dialog: MatDialog,
    private formStateService: FormStateService,
  ) {
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
          currentItems: this.model[this.key + ""],
          uploadFieldKey: this.getUploadFieldKey(),
          hasExtractZipOption: true,
          infoText: this.field.props.infoText,
          enableFileUploadOverride: this.field.props.enableFileUploadOverride,
          enableFileUploadReuse: this.field.props.enableFileUploadReuse,
          enableFileUploadRename: this.field.props.enableFileUploadRename,
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

    this.formControl.markAsDirty();
    //this.updateTableDataToForm(this.model);
  }

  private getUploadFieldKey(): string {
    return this.props.fields
      .find((field) => field.type === "upload")
      ?.key?.toString();
  }

  private getDownloadURL(uri: string) {
    return (
      this.field.props.backendUrl +
      "upload/" +
      this.formStateService.metadata().uuid +
      "/" +
      uri
    );
  }

  private getDateString(datetime: string): string {
    return new Date(datetime).toLocaleDateString();
  }

  private addUploadInfoToDatasource(file: LinkInfo) {
    const newRow = this.getEmptyEntry();
    // newRow.title = "";
    newRow[this.getUploadFieldKey()] = {
      asLink: false,
      value: file.file,
      uri: file.uri,
      lastModified: new Date(),
      sizeInBytes: file.sizeInBytes
    };
    this.replaceItem(null, newRow);
  }

  private getEmptyEntry() {
    const template = this.field.props.jsonTemplate ?? {};
    template[this.getUploadFieldKey()] = {
      asLink: true,
      value: "",
      uri: "",
    };
    return template;
  }

  private addLinkInfoToDatasource(link: any) {
    this.model[this.key + ""].push(link);
  }

  private isNotInTable(file: LinkInfo) {
    const uploadKey = this.getUploadFieldKey();
    return (
      !this.model ||
      !this.model[this.key + ""] ||
      this.model[this.key + ""]?.findIndex(
        (item) => !item[uploadKey].asLink && item[uploadKey].uri === file.uri,
      ) === -1
    );
  }

  openDialog(index?: number) {
    console.log(index);
    this.dialog
      .open(FormDialogComponent, {
        width: "90vw",
        maxWidth: "950px",
        disableClose: true,
        data: <FormDialogData>{
          fields: this.props.fields,
          model:
            index === undefined
              ? this.getEmptyEntry()
              : JSON.parse(JSON.stringify(this.model[this.key + ""][index])),
        },
        delayFocusTrap: true,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          response.link.value = response.link.uri;
          this.replaceItem(index, response);
        }
      });
  }

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    const item = this.model[this.field.key + ""][event.previousIndex];
    this.replaceItem(event.currentIndex, item, event.previousIndex);
  }

  replaceItem(index: number, item: any, previousIndex: number = null) {
    if (previousIndex !== null) {
      this.removeItem(previousIndex);
    } else if (index !== null) {
      this.removeItem(index);
    }
    const value: any[] = this.formControl.value || [];
    if (index === null || index === undefined) {
      value.push(item);
    } else {
      value.splice(index, 0, item);
    }
    this.formControl.patchValue([...value]);
    this.formControl.markAsDirty();
    this.formControl.markAsTouched();
  }

  removeItem(index: number) {
    this.formControl.patchValue(
      [...(this.formControl.value || [])].filter((_, idx) => idx !== index),
    );
    this.formControl.markAsDirty();
    this.formControl.markAsTouched();
  }

  handleCellClick(index: number, element, $event: MouseEvent) {
    //if (!this.props.supportUpload) return;

    const uploadKey = this.getUploadFieldKey();
    if (!element.asLink) {
      const options = this.props.fields[2].props;
      if (options.onClick) {
        options.onClick(
          this.formStateService.metadata().uuid,
          element.uri,
          $event,
        );
      }
    }
  }
}
