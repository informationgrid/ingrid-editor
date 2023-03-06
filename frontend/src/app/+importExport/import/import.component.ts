import { Component, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ImportExportService, ImportTypeInfo } from "../import-export-service";
import { ConfigService } from "../../services/config/config.service";
import { MatStepper } from "@angular/material/stepper";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { DocumentService } from "../../services/document/document.service";
import { FileUploadModel } from "../../shared/upload/fileUploadModel";
import { UploadComponent } from "../../shared/upload/upload.component";
import { TransfersWithErrorInfo } from "../../shared/upload/TransferWithErrors";
import { TreeQuery } from "../../store/tree/tree.query";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";

@Component({
  selector: "ige-import",
  templateUrl: "./import.component.html",
  styleUrls: ["./import.component.scss"],
})
export class ImportComponent implements OnInit {
  @ViewChild("stepper") stepper: MatStepper;
  @ViewChild("uploadComponent") uploadComponent: UploadComponent;

  file: File;
  droppedFiles: FileUploadModel[] = [];

  uploadUrl: string;

  step1Complete: any;
  optionsFormGroup = new UntypedFormGroup({
    importer: new UntypedFormControl("", Validators.required),
    option: new UntypedFormControl("overwrite_identical", Validators.required),
  });
  analyzedData: any;
  importFileErrorMessage: any;

  importers: ImportTypeInfo[];
  compatibleImporters: string[] = [];
  locationDoc: number[] = [];
  locationAddress: number[] = [];
  readyForImport = false;
  chosenFiles: TransfersWithErrorInfo[];
  private importedDocUuid: string = null;
  pathToDocument: ShortTreeNode[];
  hasImportError = false;

  constructor(
    private importExportService: ImportExportService,
    config: ConfigService,
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

  onAnalyzeComplete(info: any) {
    this.compatibleImporters = info.importer;
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
    this.importedDocUuid = data.result._uuid;
    setTimeout(() => this.stepper.next());
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
      .getPath(this.locationDoc[0])
      .subscribe((path) => (this.pathToDocument = path));

    this.hasImportError = false;

    // upload each file
    const importer = this.optionsFormGroup.get("importer").value;
    const option = this.optionsFormGroup.get("option").value;
    this.uploadComponent.setAdditionalUploadParameter({
      importerId: importer,
      parentDoc: this.locationDoc[0],
      parentAddress: this.locationAddress[0],
      options: option,
    });
    this.chosenFiles.forEach((file) => {
      this.uploadComponent.flow.flowJs.addFile(file.transfer.flowFile.file);
    });
    this.uploadComponent.flow.upload();
  }

  openImportedDocument() {
    this.router.navigate([
      `${ConfigService.catalogId}/form`,
      { id: this.importedDocUuid },
    ]);
  }
}
