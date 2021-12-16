import { Component, Inject, OnInit } from "@angular/core";
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
import { catchError, filter, map, mapTo, switchMap, tap } from "rxjs/operators";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../dialogs/confirm/confirm-dialog.component";
import { ConfigService } from "../../../../services/config/config.service";

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
export class UploadFilesDialogComponent implements OnInit {
  chosenFiles: TransfersWithErrorInfo[] = [];
  targetUrl: string;
  docId = null;
  extractZipFiles = false;

  constructor(
    private dlgRef: MatDialogRef<UploadFilesDialogComponent, LinkInfo[]>,
    private dialog: MatDialog,
    formStateService: FormStateService,
    private uploadService: UploadService,
    configService: ConfigService,
    @Inject(MAT_DIALOG_DATA) public data: { currentItems: any[] }
  ) {
    this.docId = formStateService.getForm().get("_id").value;
    this.targetUrl = `${configService.getConfiguration().backendUrl}upload/${
      this.docId
    }`;
  }

  ngOnInit(): void {}

  removeUploadedFile(fileId: string) {
    const fileNotReferenced = this.fileExistsInTable(fileId);
    if (!fileNotReferenced) {
      this.uploadService.deleteUploadedFile(this.docId, fileId);
    }
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
    forkJoin(
      this.chosenFiles.map((file) => {
        return this.uploadService.extractUploadedFilesOnServer(
          this.docId,
          file.transfer.name,
          option
        );
      })
    )
      .pipe(
        untilDestroyed(this),
        catchError((error) => this.handleExtractError(error)),
        filter((result) => result),
        map(UploadFilesDialogComponent.convertExtractResponse)
      )
      .subscribe((allFiles) => {
        this.dlgRef.close(allFiles);
      });
  }

  cancel() {
    this.chosenFiles.forEach((file) =>
      this.removeUploadedFile(file.transfer.name)
    );
    this.dlgRef.close();
  }

  private static convertExtractResponse(
    response: { files: any[] }[]
  ): LinkInfo[] {
    return UploadFilesDialogComponent.flatten(
      response.map((zipFile) =>
        zipFile.files.map((file) => ({ file: file.file, uri: file.uri }))
      )
    );
  }

  private static flatten<T>(arr: T[][]): T[] {
    return ([] as T[]).concat(...arr);
  }

  private fileExistsInTable(fileId: string): boolean {
    return (
      this.data.currentItems.find((item) => item.link.value === fileId) !==
      undefined
    );
  }

  private handleExtractError(error: any): Observable<any> {
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
          mapTo(null)
        );
    }
    throw error;
  }
}
