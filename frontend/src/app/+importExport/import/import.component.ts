import { Component, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ExchangeService, ImportTypeInfo } from "../exchange.service";
import { ConfigService } from "../../services/config/config.service";
import { MatStepper } from "@angular/material/stepper";
import { map, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { ShortTreeNode } from "../../+form/sidebars/tree/tree.types";
import { DocumentService } from "../../services/document/document.service";
import { FileUploadModel } from "../../shared/upload/fileUploadModel";
import { UploadComponent } from "../../shared/upload/upload.component";
import { TransfersWithErrorInfo } from "../../shared/upload/TransferWithErrors";
import { TreeQuery } from "../../store/tree/tree.query";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";
import { merge, Observable } from "rxjs";
import { LogResult } from "../../+catalog/indexing/index.service";
import { RxStompService } from "../../rx-stomp.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
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

  importIsRunning: boolean;

  showMore = false;

  private liveImportMessage: Observable<any> = merge(
    this.exchangeService.lastLog$.pipe(
      tap((data) =>
        data?.isRunning || data?.info?.stage === "ANALYZE"
          ? (this.step1Complete = true)
          : null
      ),
      map((data) => data?.info)
    ),
    this.rxStompService
      .watch(`/topic/jobs/import/${ConfigService.catalogId}`)
      .pipe(
        map((msg) => JSON.parse(msg.body)),
        tap((data) => (this.importIsRunning = !data.endTime)),
        tap((data) => {
          if (data.endTime) this.exchangeService.fetchLastLog();
        })
      )
  );

  message: any = {};

  constructor(
    private exchangeService: ExchangeService,
    config: ConfigService,
    private router: Router,
    private documentService: DocumentService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private rxStompService: RxStompService
  ) {
    this.uploadUrl = config.getConfiguration().backendUrl + "/upload";
  }

  ngOnInit(): void {
    this.exchangeService
      .getImportTypes()
      .pipe(tap((response) => (this.importers = response)))
      .subscribe();

    this.liveImportMessage
      .pipe(
        untilDestroyed(this),
        tap((info) => (this.message = info))
      )
      .subscribe();

    this.exchangeService.fetchLastLog();
  }

  /*
  import(files: File[]) {
    const file = files[0];
    console.log(file);
    this.exchangeService.analyze(file).subscribe(
      (data) => {
        console.log("Import result:", data);
      },
      (error) => (this.importFileErrorMessage = error)
    );
    // TODO: remove after testing
    this.step1Complete = true;
  }
*/

  onUploadComplete(info: any) {
    /*this.compatibleImporters = info.importer;
    const importerControl = this.optionsFormGroup.get("importer");
    if (this.compatibleImporters.length === 1) {
      importerControl.setValue(this.compatibleImporters[0]);
      importerControl.disable();
    } else {
      importerControl.enable();
    }*/
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
    /*this.documentService
      .getPath(this.locationDoc[0].toString())
      .subscribe((path) => (this.pathToDocument = path));*/

    this.hasImportError = false;

    // upload each file
    const importer = this.optionsFormGroup.get("importer").value;
    const option = this.optionsFormGroup.get("option").value;
    /*this.uploadComponent.setAdditionalUploadParameter({
      importerId: importer,
      parentDoc: this.locationDoc[0],
      parentAddress: this.locationAddress[0],
      options: option,
    });
    this.chosenFiles.forEach((file) => {
      this.uploadComponent.flow.flowJs.addFile(file.transfer.flowFile.file);
    });
    this.uploadComponent.flow.upload();*/
    this.exchangeService.import().subscribe();
  }

  openImportedDocument() {
    this.router.navigate([
      `${ConfigService.catalogId}/form`,
      { id: this.importedDocUuid },
    ]);
  }

  abortImportJob() {
    this.exchangeService.stopJob();
    this.cancel();
  }
}
