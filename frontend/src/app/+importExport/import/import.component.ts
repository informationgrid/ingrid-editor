import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ImportExportService } from "../import-export-service";
import { ConfigService } from "../../services/config/config.service";
import { FileUploadModel } from "../upload/upload.component";

@Component({
  selector: "ige-import",
  templateUrl: "./import.component.html",
  styleUrls: ["./import.component.scss"],
})
export class ImportComponent implements OnInit {
  file: File;
  droppedFiles: FileUploadModel[] = [];

  currentTab: string;

  formFields = [];
  form = null;

  msgs: any[];
  uploadedFiles: any[] = [];

  uploadUrl: string;

  datasetSelected: any;
  activeStepIndex = 0;
  secondFormGroup = new FormGroup({});
  analyzedData: any;
  importFileErrorMessage: any;

  constructor(
    private importExportService: ImportExportService,
    config: ConfigService
  ) {
    // this.uploader = new FileUploader({url: config.getConfiguration().backendUrl + '/upload'});
    this.uploadUrl = config.getConfiguration().backendUrl + "/upload";

    const ctrl = new FormControl("xxx");
    this.form = new FormGroup({ title: ctrl });
  }

  ngOnInit(): void {
    this.currentTab = "import";
  }

  import(files: File[]) {
    const file = files[0];
    console.log(file);
    this.importExportService.import(file).subscribe(
      (data) => {
        console.log("Import result:", data);
      },
      (error) => (this.importFileErrorMessage = error)
    );
  }

  onFileComplete(data: any) {
    console.log(data); // We just print out data bubbled up from event emitter.
    this.analyzedData = data;
    this.datasetSelected = true;
    setTimeout(() => (this.activeStepIndex = 1));
  }

  /**
   * on file drop handler
   */
  onFileDropped(files: FileList) {
    console.log(files);
    for (let index = 0; index < files.length; index++) {
      this.droppedFiles.push({
        data: files.item(index),
        state: "in",
        inProgress: false,
        progress: 0,
        canRetry: false,
        canCancel: true,
      });
    }
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      // this.files.push(item);
    }
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
}
