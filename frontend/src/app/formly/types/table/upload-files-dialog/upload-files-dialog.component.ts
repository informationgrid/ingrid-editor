import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { FormStateService } from "../../../../+form/form-state.service";
import { TransfersWithErrorInfo } from "../../../../shared/upload/TransferWithErrors";
import { UploadService } from "../../../../shared/upload/upload.service";

@Component({
  selector: "ige-upload-files-dialog",
  templateUrl: "./upload-files-dialog.component.html",
  styleUrls: ["./upload-files-dialog.component.scss"],
})
export class UploadFilesDialogComponent implements OnInit {
  droppedFiles: any = [];
  chosenFiles: TransfersWithErrorInfo[] = [];
  targetUrl = "/api/upload/";
  docId = null;

  constructor(
    private dlgRef: MatDialogRef<UploadFilesDialogComponent>,
    formStateService: FormStateService,
    private uploadService: UploadService
  ) {
    this.docId = formStateService.getForm().get("_id").value;
    this.targetUrl += this.docId;
  }

  ngOnInit(): void {}

  onFileComplete() {
    console.log(this.droppedFiles[0]);
  }

  removeUploadedFile(fileId: string) {
    this.uploadService.deleteUploadedFile(this.docId, fileId);
  }

  submit() {
    this.dlgRef.close(this.chosenFiles);
  }

  cancel() {
    this.chosenFiles.forEach((file) =>
      this.removeUploadedFile(file.transfer.id)
    );
    this.dlgRef.close();
  }
}
