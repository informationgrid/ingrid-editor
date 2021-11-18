import { Component, OnInit } from "@angular/core";
import { Transfer } from "@flowjs/ngx-flow";
import { MatDialogRef } from "@angular/material/dialog";
import { FormStateService } from "../../../../+form/form-state.service";

@Component({
  selector: "ige-upload-files-dialog",
  templateUrl: "./upload-files-dialog.component.html",
  styleUrls: ["./upload-files-dialog.component.scss"],
})
export class UploadFilesDialogComponent implements OnInit {
  droppedFiles: any = [];
  chosenFiles: Transfer[] = [];
  targetUrl = "/api/upload/";

  constructor(
    private dlgRef: MatDialogRef<UploadFilesDialogComponent>,
    formStateService: FormStateService
  ) {
    this.targetUrl += formStateService.getForm().get("_id").value;
  }

  ngOnInit(): void {}

  onAnalyzeComplete($event) {
    console.log("analyzed", $event);
  }

  onFileComplete($event: string) {
    console.log(this.droppedFiles[0]);
  }

  submit() {
    this.dlgRef.close(this.chosenFiles);
  }
}
