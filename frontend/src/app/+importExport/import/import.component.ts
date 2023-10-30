import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  ExchangeService,
  ImportLogInfo,
  ImportTypeInfo,
} from "../exchange.service";
import { ConfigService } from "../../services/config/config.service";
import { MatStepper } from "@angular/material/stepper";
import { filter, map, take, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { DocumentService } from "../../services/document/document.service";
import { FileUploadModel } from "../../shared/upload/fileUploadModel";
import { UploadComponent } from "../../shared/upload/upload.component";
import { TransfersWithErrorInfo } from "../../shared/upload/TransferWithErrors";
import { TreeQuery } from "../../store/tree/tree.query";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";
import { merge, Observable } from "rxjs";
import { RxStompService } from "../../rx-stomp.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatDialog } from "@angular/material/dialog";
import {
  PasteDialogComponent,
  PasteDialogOptions,
} from "../../+form/dialogs/copy-cut-paste/paste-dialog.component";

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

  step1Complete: any;
  optionsFormGroup = new FormGroup({
    importer: new FormControl<string>(
      { value: "", disabled: true },
      Validators.required,
    ),
    overwriteAddresses: new FormControl<boolean>(false),
    publish: new FormControl<boolean>(false),
    parentDocument: new FormControl<number>(null),
    parentAddress: new FormControl<number>(null),
  });

  importers: ImportTypeInfo[];
  chosenFiles: TransfersWithErrorInfo[];

  importIsRunning: boolean;

  showMore = false;

  errorInAnalysis = false;

  private liveImportMessage: Observable<any> = merge(
    this.exchangeService.lastLog$.pipe(
      filter((log) => log?.info !== undefined),
      tap((data) => {
        this.step1Complete = !!(
          data?.isRunning || data?.info?.stage === "ANALYZE"
        );
      }),
      map((data) => data?.info),
      tap((info: ImportLogInfo) =>
        this.optionsFormGroup
          .get("importer")
          .setValue(
            info?.report?.importers ? info?.report?.importers[0] : null,
          ),
      ),
      tap(
        (info: ImportLogInfo) =>
          (this.errorInAnalysis = info?.errors?.length > 0),
      ),
      tap(() => (this.lastLogReceived = true)),
    ),
    this.rxStompService
      .watch(`/topic/jobs/import/${ConfigService.catalogId}`)
      .pipe(
        map((msg) => JSON.parse(msg.body)),
        tap((data) => this.handleRunningInfo(data)),
      ),
  );

  message: ImportLogInfo;

  parent = {
    documentPath: [],
    addressPath: [],
  };

  lastLogReceived: boolean = false;
  websocketConnected: boolean = false;

  constructor(
    private exchangeService: ExchangeService,
    private router: Router,
    private documentService: DocumentService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private rxStompService: RxStompService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // wait for websocket connection to be ready to receive import state
    this.rxStompService.connected$.pipe(take(1)).subscribe(() => {
      this.websocketConnected = true;
    });

    this.exchangeService
      .getImportTypes()
      .pipe(tap((response) => (this.importers = response)))
      .subscribe();

    this.liveImportMessage
      .pipe(
        untilDestroyed(this),
        tap((info) => {
          // activate change detection, since sometimes view is not updated
          setTimeout(() => (this.message = info));
        }),
      )
      .subscribe();

    this.exchangeService.fetchLastLog();
  }

  onUploadComplete() {
    this.step1Complete = true;
  }

  cancel() {
    this.droppedFiles = [];
    this.stepper.selectedIndex = 0;
    this.step1Complete = false;
  }

  startImport() {
    const options = this.optionsFormGroup.value;
    this.exchangeService.import(options).subscribe();
  }

  openImportedDocument() {
    this.router.navigate([
      `${ConfigService.catalogId}/form`,
      {
        id: this.message.report.references.filter((ref) => !ref.isAddress)[0]
          .document._uuid,
      },
    ]);
  }

  abortImportJob() {
    this.exchangeService.stopJob();
    this.cancel();
  }

  private handleRunningInfo(data: any) {
    this.importIsRunning = !data.endTime;
    if (data?.stage === "ANALYZE") {
      this.showMore = true;
      this.errorInAnalysis = data.errors?.length > 0;
    }

    // remove already loaded tree node information
    if (data?.stage === "IMPORT") this.documentService.clearTreeStores();
  }

  chooseLocationForDatasets() {
    this.chooseLocation(false, this.optionsFormGroup.controls.parentDocument);
  }

  chooseLocationForAddresses() {
    this.chooseLocation(true, this.optionsFormGroup.controls.parentAddress);
  }

  chooseLocation(isAddress: boolean, formControlForParent: FormControl) {
    this.dialog
      .open(PasteDialogComponent, {
        data: <PasteDialogOptions>{
          forAddress: isAddress,
          titleText: "Ordner auswählen",
          typeToInsert: "FOLDER",
        },
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((target: any) => {
        formControlForParent.setValue(target.selection);
        if (isAddress) {
          const title = this.addressTreeQuery.getEntity(target.selection)
            ?.title;
          this.documentService
            .getPath(target.selection)
            .subscribe((path) => (this.parent.addressPath = path));
        } else {
          const title = this.treeQuery.getEntity(target.selection)?.title;
          this.documentService
            .getPath(target.selection)
            .subscribe((path) => (this.parent.documentPath = path));
        }
      });
  }

  protected readonly ConfigService = ConfigService;
}
