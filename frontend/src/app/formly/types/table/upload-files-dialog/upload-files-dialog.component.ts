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
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { FormStateService } from "../../../../+form/form-state.service";
import { TransfersWithErrorInfo } from "../../../../shared/upload/TransferWithErrors";
import {
  ExtractOption,
  UploadService,
} from "../../../../shared/upload/upload.service";
import { forkJoin, Observable } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { catchError, filter, map, mapTo, tap } from "rxjs/operators";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../dialogs/confirm/confirm-dialog.component";
import { ConfigService } from "../../../../services/config/config.service";
import { AuthenticationFactory } from "../../../../security/auth.factory";

export interface LinkInfo {
  file: string;
  uri: string;
}

@UntilDestroy()
@Component({
  selector: "ige-upload-files-dialog",
  templateUrl: "./upload-files-dialog.component.html",
  styleUrls: ["./upload-files-dialog.component.scss"],
})
export class UploadFilesDialogComponent implements OnInit, OnDestroy {
  chosenFiles: TransfersWithErrorInfo[] = [];
  targetUrl: string;
  docUuid = null;
  uploadComplete = false;
  allowedUploadTypes: string[];

  // zip extraction
  hasExtractZipOption: boolean;
  extractZipFiles = false;
  extractInProgress = false;
  infoText;
  refreshTimer$: number = null;

  constructor(
    private dlgRef: MatDialogRef<UploadFilesDialogComponent, LinkInfo[]>,
    private dialog: MatDialog,
    formStateService: FormStateService,
    private uploadService: UploadService,
    configService: ConfigService,
    private authFactory: AuthenticationFactory,
    @Inject(MAT_DIALOG_DATA)
    private data: {
      currentItems: any[];
      uploadFieldKey: string;
      allowedUploadTypes?: string[];
      hasExtractZipOption?: boolean;
      infoText?: String;
    },
  ) {
    this.docUuid = formStateService.metadata().uuid;
    this.targetUrl = `${configService.getConfiguration().backendUrl}upload/${
      this.docUuid
    }`;
    this.allowedUploadTypes = data.allowedUploadTypes;
    this.hasExtractZipOption = data.hasExtractZipOption;
    this.infoText = data.infoText;
  }

  ngOnInit(): void {
    // refresh token to in this dialog to prevent auto-save, since this might lead to
    // a removal of uploaded files (#6386)
    this.refreshTimer$ = setInterval(() => {
      return this.authFactory.get().refreshToken();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer$ != null) {
      clearInterval(this.refreshTimer$);
    }
  }

  removeUploadedFile(fileId: string) {
    console.log("uploaded files will not be removed for now due to a bug");
    /*const fileNotReferenced = this.fileExistsInTable(fileId);
    if (!fileNotReferenced) {
      this.uploadService.deleteUploadedFile(this.docUuid, fileId);
    }*/
  }

  submit() {
    if (this.extractZipFiles) {
      this.extractAndCloseDialog();
    } else {
      this.dlgRef.close(this.getSuccessfulUploadedFiles());
    }
  }

  private getSuccessfulUploadedFiles(): LinkInfo[] {
    return this.chosenFiles
      .filter((file) => file.transfer.success)
      .map((file) => ({ file: file.transfer.name, uri: file.transfer.name }));
  }

  private extractAndCloseDialog(option?: ExtractOption) {
    this.extractInProgress = true;
    forkJoin(
      this.chosenFiles.map((file) => {
        return this.uploadService.extractUploadedFilesOnServer(
          this.docUuid,
          file.transfer.name,
          option,
        );
      }),
    )
      .pipe(
        untilDestroyed(this),
        catchError((error) => this.handleExtractError(error)),
        filter((result) => result),
        map(UploadFilesDialogComponent.convertExtractResponse),
      )
      .subscribe((allFiles) => {
        this.dlgRef.close(allFiles);
      });
  }

  cancel() {
    this.chosenFiles.forEach((file) =>
      this.removeUploadedFile(file.transfer.name),
    );
    this.dlgRef.close();
  }

  private static convertExtractResponse(
    response: { files: any[] }[],
  ): LinkInfo[] {
    return UploadFilesDialogComponent.flatten(
      response.map((zipFile) =>
        zipFile.files.map((file) => ({
          file: file.file,
          uri: decodeURIComponent(file.uri),
        })),
      ),
    );
  }

  private static flatten<T>(arr: T[][]): T[] {
    return ([] as T[]).concat(...arr);
  }

  private fileExistsInTable(fileId: string): boolean {
    return (
      this.data.currentItems.find(
        (item) => item[this.data.uploadFieldKey].value === fileId,
      ) !== undefined
    );
  }

  private handleExtractError(error: any): Observable<any> {
    this.extractInProgress = false;
    if (error.status === 409) {
      return this.dialog
        .open(ConfirmDialogComponent, {
          data: <ConfirmDialogData>{
            title: "Konflikt",
            message:
              "Es trat ein Konflikt beim extrahieren der ZIP-Datei auf, was möchten Sie jetzt tun?",
            buttons: [
              { text: "Abbrechen" },
              { text: "Überschreiben", id: "REPLACE", alignRight: true },
              { text: "Umbenennen", id: "RENAME", alignRight: true },
            ],
          },
        })
        .afterClosed()
        .pipe(
          tap((result) => {
            if (result) {
              this.extractAndCloseDialog(result);
            }
          }),
          mapTo(null),
        );
    }
    throw error;
  }

  handleUploadComplete() {
    this.uploadComplete = true;
  }

  updateChosenFiles($event: TransfersWithErrorInfo[]) {
    // update completed uploads only for new uploads and ignore if upload only was updated or removed
    if (this.chosenFiles.length < $event.length || $event.length === 0) {
      this.uploadComplete = false;
    }
    this.chosenFiles = $event;
  }
}
