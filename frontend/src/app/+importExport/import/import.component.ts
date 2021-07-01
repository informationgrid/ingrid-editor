import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  ImportExportService,
  ImportTypeInfo,
  UploadAnalysis,
} from "../import-export-service";
import { ConfigService } from "../../services/config/config.service";
import { FileUploadModel } from "../upload/upload.component";
import { MatStepper } from "@angular/material/stepper";
import { tap } from "rxjs/operators";
import { UploadService } from "../upload/upload.service";

@Component({
  selector: "ige-import",
  templateUrl: "./import.component.html",
  styleUrls: ["./import.component.scss"],
})
export class ImportComponent implements OnInit {
  @ViewChild("stepper") stepper: MatStepper;
  file: File;
  droppedFiles: FileUploadModel[] = [];

  uploadUrl: string;

  step1Complete: any;
  optionsFormGroup = new FormGroup({
    importer: new FormControl("", Validators.required),
    option: new FormControl("overwrite_identical", Validators.required),
  });
  analyzedData: any;
  importFileErrorMessage: any;

  importers: ImportTypeInfo[];
  compatibleImporters: string[] = [];
  locationDoc: string[] = [];
  locationAddress: string[] = [];
  readyForImport = false;
  chosenFiles: FileUploadModel[];

  constructor(
    private importExportService: ImportExportService,
    config: ConfigService,
    private uploadService: UploadService
  ) {
    this.uploadUrl = config.getConfiguration().backendUrl + "/upload";
  }

  ngOnInit(): void {
    this.importExportService
      .getImportTypes()
      .pipe(tap((response) => (this.importers = response)))
      .subscribe();
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

  onAnalyzeComplete(info: UploadAnalysis) {
    this.compatibleImporters = info.analysis.importer;
    if (this.compatibleImporters.length === 1) {
      this.optionsFormGroup
        .get("importer")
        .setValue(this.compatibleImporters[0]);
    }
    this.step1Complete = true;
  }

  onFileComplete(data: any) {
    console.log(data); // We just print out data bubbled up from event emitter.
    this.analyzedData = data;
    this.step1Complete = true;
    setTimeout(() => this.stepper.next());
  }

  /**
   * on file drop handler
   */
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

  cancel() {
    this.droppedFiles = [];
    this.stepper.selectedIndex = 0;
    this.step1Complete = false;
  }

  setLocation(location: string[], isAddress: boolean) {
    isAddress
      ? (this.locationAddress = location)
      : (this.locationDoc = location);
    this.readyForImport =
      this.locationDoc.length === 1 && this.locationAddress.length === 1;
  }

  startImport() {
    this.chosenFiles.forEach((file) => {
      const importer = this.optionsFormGroup.get("importer").value;
      const option = this.optionsFormGroup.get("option").value;
      this.uploadService
        .uploadFile(
          file,
          "file",
          `api/import?importerId=${importer}&parentDoc=${this.locationDoc[0]}&parentAddress=${this.locationAddress[0]}&options=${option}`
        )
        .pipe(tap((response) => console.log("File imported", response)))
        .subscribe();
    });
  }
}
