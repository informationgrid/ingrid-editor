import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  ImportExportService,
  ImportTypeInfo,
  UploadAnalysis,
} from "../import-export-service";
import { ConfigService } from "../../services/config/config.service";
import { MatStepper } from "@angular/material/stepper";
import { catchError, tap } from "rxjs/operators";
import { UploadService } from "../upload/upload.service";
import { Router } from "@angular/router";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { DocumentService } from "../../services/document/document.service";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { IgeError } from "../../models/ige-error";
import { FileUploadModel } from "../upload/fileUploadModel";

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
  private importedDocId: string = null;
  pathToDocument: ShortTreeNode[];
  hasImportError = false;

  constructor(
    private importExportService: ImportExportService,
    config: ConfigService,
    private uploadService: UploadService,
    private router: Router,
    private documentService: DocumentService
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
    const importerControl = this.optionsFormGroup.get("importer");
    if (this.compatibleImporters.length === 1) {
      importerControl.setValue(this.compatibleImporters[0]);
      importerControl.disable();
    } else {
      importerControl.enable();
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
    // get path for destination for final page
    this.documentService
      .getPath(this.locationDoc[0])
      .subscribe((path) => (this.pathToDocument = path));

    this.hasImportError = false;

    // upload each file
    this.chosenFiles.forEach((file) => {
      const importer = this.optionsFormGroup.get("importer").value;
      const option = this.optionsFormGroup.get("option").value;
      this.uploadService
        .uploadFile(
          file,
          "file",
          `api/import?importerId=${importer}&parentDoc=${this.locationDoc[0]}&parentAddress=${this.locationAddress[0]}&options=${option}`
        )
        .pipe(
          catchError((error) => this.handleError(error)),
          tap((response) => console.log("File imported", response)),
          tap(
            (response: HttpResponse<any>) =>
              (this.importedDocId = response.body.result._id)
          )
        )
        .subscribe();
    });
  }

  openImportedDocument() {
    this.router.navigate(["/form", { id: this.importedDocId }]);
  }

  private handleError(error: IgeError): Observable<HttpResponse<any>> {
    this.hasImportError = true;
    throw error;
  }
}
