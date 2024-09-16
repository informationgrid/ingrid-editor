/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import {
  DatasetInfo,
  ExchangeService,
  ImportLogInfo,
  ImportTypeInfo,
} from "../exchange.service";
import { ConfigService } from "../../services/config/config.service";
import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperNext,
  MatStepperPrevious,
} from "@angular/material/stepper";
import { filter, map, take, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { DocumentService } from "../../services/document/document.service";
import { FileUploadModel } from "../../shared/upload/fileUploadModel";
import { UploadComponent } from "../../shared/upload/upload.component";
import { TransfersWithErrorInfo } from "../../shared/upload/TransferWithErrors";
import { merge, Observable } from "rxjs";
import { RxStompService } from "../../rx-stomp.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatDialog } from "@angular/material/dialog";
import {
  PasteDialogComponent,
  PasteDialogOptions,
} from "../../+form/dialogs/copy-cut-paste/paste-dialog.component";
import { IgeError } from "../../models/ige-error";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { JobHandlerHeaderComponent } from "../../shared/job-handler-header/job-handler-header.component";
import { DatePipe, NgTemplateOutlet } from "@angular/common";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatButton } from "@angular/material/button";
import { MatCheckbox } from "@angular/material/checkbox";
import { BreadcrumbComponent } from "../../+form/form-info/breadcrumb/breadcrumb.component";
import { MatIcon } from "@angular/material/icon";
import { ImportReportComponent } from "./import-report/import-report.component";

@UntilDestroy()
@Component({
  selector: "ige-import",
  templateUrl: "./import.component.html",
  styleUrls: ["./import.component.scss"],
  standalone: true,
  imports: [
    PageTemplateComponent,
    JobHandlerHeaderComponent,
    NgTemplateOutlet,
    MatStepper,
    MatStep,
    MatStepLabel,
    UploadComponent,
    MatProgressSpinner,
    MatButton,
    MatStepperNext,
    ReactiveFormsModule,
    MatCheckbox,
    BreadcrumbComponent,
    MatStepperPrevious,
    MatIcon,
    ImportReportComponent,
    DatePipe,
  ],
})
export class ImportComponent implements OnInit {
  @ViewChild("stepper") stepper: MatStepper;
  @ViewChild("uploadComponent") uploadComponent: UploadComponent;

  file: File;
  droppedFiles: FileUploadModel[] = [];

  private validParentValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let value = control.value;
      return value === null && !this.configService.hasWriteRootPermission()
        ? { invalidParent: { value: value } }
        : null;
    };
  }

  step1Complete: any;
  optionsFormGroup = new FormGroup({
    importer: new FormControl<string>(
      { value: "", disabled: true },
      Validators.required,
    ),
    overwriteAddresses: new FormControl<boolean>(false),
    publish: new FormControl<boolean>(false),
    parentDocument: new FormControl<number>(null, this.validParentValidator()),
    parentAddress: new FormControl<number>(null, this.validParentValidator()),
  });

  importers: ImportTypeInfo[];
  chosenFiles: TransfersWithErrorInfo[];

  importIsRunning: boolean;

  showMore = false;

  errorInAnalysis = false;

  datasetsWithNoPermission: DatasetInfo[] = [];

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

  protected readonly ConfigService = ConfigService;

  constructor(
    private exchangeService: ExchangeService,
    private router: Router,
    private documentService: DocumentService,
    private rxStompService: RxStompService,
    private dialog: MatDialog,
    private configService: ConfigService,
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
          typeToInsert: isAddress ? "organization" : "FOLDER",
        },
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((target: any) => {
        formControlForParent.setValue(target.selection);
        if (isAddress) {
          this.documentService
            .getPath(target.selection)
            .subscribe((path) => (this.parent.addressPath = path));
        } else {
          this.documentService
            .getPath(target.selection)
            .subscribe((path) => (this.parent.documentPath = path));
        }
      });
  }

  handleStepEvent(index: number, retries = 0) {
    if (index !== 1) return;
    this.datasetsWithNoPermission = [];

    const action = () =>
      this.message.report.existingDatasets.map((dataset) =>
        this.documentService
          .uuidExists(dataset.uuid)
          .pipe(filter((exists) => !exists))
          .subscribe(() => {
            console.error(`${dataset.uuid} cannot be accessed`);
            this.datasetsWithNoPermission.push(dataset);
          }),
      );

    // in case the report has not been ready yet
    // TODO: find a better solution
    if (this.message.report) action();
    else if (retries === 3) {
      throw new IgeError("Report was not ready after 3 retries");
    } else {
      setTimeout(() => this.handleStepEvent(index, retries + 1), 500);
    }
  }
}
