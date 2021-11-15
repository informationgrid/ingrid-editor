import { Component, OnInit } from "@angular/core";
import { FileUploadModel } from "../../../../+importExport/upload/fileUploadModel";

@Component({
  selector: "ige-upload-files-dialog",
  templateUrl: "./upload-files-dialog.component.html",
  styleUrls: ["./upload-files-dialog.component.scss"],
})
export class UploadFilesDialogComponent implements OnInit {
  droppedFiles: any = [];
  chosenFiles: FileUploadModel[] = [];

  constructor() {}

  ngOnInit(): void {}

  onAnalyzeComplete($event) {
    console.log("analyzed", $event);
  }

  onFileComplete($event: string) {
    console.log(this.droppedFiles[0]);
  }

  onFileDropped(files: FileList) {
    console.log(files);
    for (let index = 0; index < files.length; index++) {
      this.droppedFiles = [
        ...this.droppedFiles,
        {
          data: files.item(index),
          state: "in",
          inProgress: false,
          progress: 0,
          canRetry: false,
          canCancel: true,
        },
      ];
    }
  }
}
