import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormStateService } from "../../../../+form/form-state.service";
import { TransfersWithErrorInfo } from "../../../../shared/upload/TransferWithErrors";
import { UploadService } from "../../../../shared/upload/upload.service";
import { forkJoin } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { map } from "rxjs/operators";

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
  targetUrl = "/api/upload/";
  docId = null;
  extractZipFiles = false;

  constructor(
    private dlgRef: MatDialogRef<UploadFilesDialogComponent, LinkInfo[]>,
    formStateService: FormStateService,
    private uploadService: UploadService,
    @Inject(MAT_DIALOG_DATA) public data: { currentItems: any[] }
  ) {
    this.docId = formStateService.getForm().get("_id").value;
    this.targetUrl += this.docId;
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

  private extractAndCloseDialog() {
    forkJoin(
      this.chosenFiles.map((file) => {
        return this.uploadService.extractUploadedFilesOnServer(
          this.docId,
          file.transfer.name
        );
      })
    )
      .pipe(
        untilDestroyed(this),
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
}
