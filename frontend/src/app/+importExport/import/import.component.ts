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
import { catchError, tap } from "rxjs/operators";
import { UploadService } from "../upload/upload.service";
import { Router } from "@angular/router";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { DocumentService } from "../../services/document/document.service";
import { HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { IgeError } from "../../models/ige-error";
import { TreeQuery } from "../../store/tree/tree.query";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";

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
  locationDoc: number[] = [];
  locationAddress: number[] = [];
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
    private documentService: DocumentService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery
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

  cancel() {
    this.droppedFiles = [];
    this.stepper.selectedIndex = 0;
    this.step1Complete = false;
  }

  setLocation(location: string[], isAddress: boolean) {
    if (isAddress) {
      const locationId = this.addressTreeQuery
        .getAll()
        .filter((entity) => entity._uuid === location[0])
        .map((entity) => <number>entity.id);
      this.locationAddress = locationId;
    } else {
      const locationId = this.treeQuery
        .getAll()
        .filter((entity) => entity._uuid === location[0])
        .map((entity) => <number>entity.id);
      this.locationDoc = locationId;
    }
    this.readyForImport =
      this.locationDoc.length === 1 && this.locationAddress.length === 1;
  }

  startImport() {
    // get path for destination for final page
    this.documentService
      .getPath(this.locationDoc[0].toString())
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
              (this.importedDocId = response.body.result._uuid)
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
