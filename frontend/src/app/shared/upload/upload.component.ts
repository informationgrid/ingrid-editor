/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  input,
  computed,
  Signal,
  AfterViewInit,
  output,
} from "@angular/core";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { FlowConfig, NgxFlowModule, Transfer } from "@flowjs/ngx-flow";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { map, skip } from "rxjs/operators";
import { IgeError } from "../../models/ige-error";
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { TransfersWithErrorInfo } from "./TransferWithErrors";
import { UploadError, UploadService } from "./upload.service";
import { TranslocoService } from "@jsverse/transloco";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import { UploadItemComponent } from "./upload-item/upload-item.component";
import { AsyncPipe } from "@angular/common";

@UntilDestroy()
@Component({
  selector: "ige-file-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.scss"],
  animations: [
    trigger("fadeInOut", [
      state("in", style({ opacity: 100 })),
      transition("* => void", [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
  imports: [NgxFlowModule, MatIcon, MatButton, UploadItemComponent, AsyncPipe],
})
export class UploadComponent implements AfterViewInit {
  /** Link text */
  readonly text = input(
    this.transloco.translate("form.placeholder.chooseFile"),
  );
  /** Name used in form which will be sent in HTTP request. */
  readonly param = input("file");
  /** Target URL for file uploading. */
  readonly targetAnalyze = input(undefined);

  /** File extension that accepted, same as 'accept' of <input type="file" />.
   By the default, it's set to 'image/*'. */
  readonly accept = input("*.*");

  /* automatically upload files after drop/select */
  readonly autoupload = input(true);

  /* hide everything except the progressed files */
  readonly showOnlyProgress = input(false);

  /* allow only specific file types when given */
  readonly allowedUploadTypes = input<string[]>(undefined);

  @Input() infoText: string;
  enableFileUploadOverride = input<boolean>();
  enableFileUploadReuse = input<boolean>();
  enableFileUploadRename = input<boolean>();

  readonly complete = output<void>();
  readonly chosenFiles = output<TransfersWithErrorInfo[]>();
  readonly removeFile = output<string>();

  @ViewChild("flow") flow: FlowConfig;

  target = input.required<string>();
  multiple = input<boolean>();
  dropZoneText = computed(() =>
    this.multiple()
      ? "Datei(en) zum Hochladen hier ablegen"
      : "Datei zum Hochladen hier ablegen",
  );
  flowConfig: Signal<flowjs.FlowOptions> = computed(() => ({
    target: this.target(),
    testChunks: false,
    forceChunkSize: false,
    maxChunkRetries: 2,
  }));
  _errors: { [x: string]: UploadError } = {};
  errors = new BehaviorSubject<{ [x: string]: UploadError }>({});
  filesForUpload = new Subject<TransfersWithErrorInfo[]>();

  /* characters that are forbidden within file name */
  private forbiddenCharInName = "<>:'\"%$/|?*";

  // parameters to send with the upload information
  additionalParameters = input<any>({});

  constructor(
    private uploadService: UploadService,
    private transloco: TranslocoService,
  ) {}

  ngAfterViewInit() {
    combineLatest([this.errors, this.flow.transfers$])
      .pipe(
        untilDestroyed(this),
        skip(1), // do not use initial value
        map((result) =>
          (result as any)[1].transfers.map(
            (transfer) =>
              new TransfersWithErrorInfo(result[0][transfer.id], transfer),
          ),
        ),
      )
      .subscribe((result) => {
        this.filesForUpload.next(result);
        this.chosenFiles.emit(result);
      });

    this.flow.events$.pipe(untilDestroyed(this)).subscribe(async (event) => {
      try {
        if (this.autoupload() && event.type === "filesSubmitted") {
          const flowFiles = <flowjs.FlowFile[]>event.event[0];
          await this.uploadService.updateAuthenticationToken(flowFiles);
          this.resetParametersForSubmittedFiles(flowFiles);
          this.flow.upload();
        } else if (event.type === "fileProgress") {
          await this.uploadService.updateAuthenticationToken([
            (<flowjs.FlowChunk>event.event[1]).fileObj,
          ]);
        } else if (event.type === "fileError") {
          this.handleUploadError(event.event);
        } else if (event.type === "fileSuccess") {
          const messageSuccess = this.getMessageFromResponse(
            event.event[2].xhr,
          );
          const fileIdentifier = this.getFileIdentifier(event.event);
          this._errors[fileIdentifier] = null;
          this.errors.next(this._errors);
          this.complete.emit(messageSuccess);
        }
      } catch (e) {
        console.error("Error uploading file", e);
        throw new IgeError(e);
      }
    });

    this.flow.flowJs.on("filesAdded", (files) => {
      const invalidFile = this.validateFileNames(files);
      if (invalidFile != undefined) {
        throw new IgeError(
          `Der Dateiname von [${invalidFile.name}] enthält ein ungültiges Zeichen [${invalidFile.char}].
          Bitte korrigieren Sie den Dateinamen und laden Sie die Datei erneut hoch.`,
        );
      }
      const invalidFormat = this.validateUploadTypes(files);
      if (invalidFormat != undefined) {
        const allowedTypes = this.allowedUploadTypes().join(", ");
        throw new IgeError(
          `Das Hochladen von Dateien im [${invalidFormat}] Format ist nicht erlaubt.
           Zugelassene Dateiformate sind: ${allowedTypes}.`,
        );
      }
      return true;
    });
  }

  // it returns the name of file and its invalid character when found
  private validateFileNames(files: flowjs.FlowFile[]): { name; char } {
    const forbiddenChars = this.forbiddenCharInName.split("");
    for (const file of files) {
      for (const char of forbiddenChars) {
        if (file.name.includes(char)) return { name: file.name, char: char };
      }
    }
  }

  // it returns an invalid upload type when identified
  private validateUploadTypes(files: flowjs.FlowFile[]): string {
    const allowedUploadTypes = this.allowedUploadTypes();
    if (allowedUploadTypes == undefined) return;
    for (const file of files) {
      const type = file.getType();
      const isTypeAllowed = allowedUploadTypes.includes(type);
      if (!isTypeAllowed) return type;
    }
  }

  private resetParametersForSubmittedFiles(flowFiles: flowjs.FlowFile[]) {
    flowFiles.forEach(
      (file) => (file.flowObj.opts.query = { ...this.additionalParameters() }),
    );
  }

  isDragged = false;
  counter = 0;

  setDragged(isDragged: boolean) {
    if (isDragged) {
      this.counter++;
      this.isDragged = true;
    } else {
      this.counter--;
      if (this.counter === 0) {
        this.isDragged = false;
      }
    }
  }

  getIdentifier(index, item: TransfersWithErrorInfo) {
    return item.transfer.id;
  }

  updateFileToUseExisting(transfer: Transfer) {
    this._errors[transfer.id] = null;
    transfer.success = true;
    this.errors.next(this._errors);
    this.complete.emit();
  }

  private handleUploadError(event: flowjs.FlowEventFromEventName<any>) {
    const errorResponse = event[2].xhr;

    const fileIdentifier = this.getFileIdentifier(event);

    const detail = this.getMessageFromResponse(errorResponse);

    let message = detail.message ?? detail.errorText,
      data = detail.errorData ?? detail.errorId;

    if (detail.errorText === "IllegalSizeException") {
      if (detail.errorData.limitType === "FILE") {
        message = this.transloco
          .translate("upload.errorMessages.fileSize")
          .replace("{maxSize}", detail.errorData.maxSize);
      } else if (detail.errorData.limitType === "DIRECTORY") {
        message = this.transloco
          .translate("upload.errorMessages.directorySize")
          .replace("{maxSize}", detail.errorData.maxSize);
      }
    }

    this._errors[fileIdentifier] = new UploadError(
      errorResponse.status,
      message,
      data,
    );
    this.errors.next(this._errors);
  }

  private getFileIdentifier(event: flowjs.FlowEventFromEventName<any>) {
    return (<flowjs.FlowFile>event[0]).uniqueIdentifier;
  }

  private getMessageFromResponse(error: XMLHttpRequest): any {
    try {
      return JSON.parse(error.responseText);
    } catch (ex) {
      return { message: error.responseText };
    }
  }

  async retryUpload(file: TransfersWithErrorInfo, parameter: any = {}) {
    this._errors[file.transfer.id] = null;
    const flowFile = file.transfer.flowFile;
    await this.uploadService.updateAuthenticationToken([flowFile]);
    if (parameter.rename) {
      flowFile.name = parameter.altName;
    } else {
      flowFile.flowObj.opts.query = {
        ...this.additionalParameters(),
        ...parameter,
      };
    }
    flowFile.retry();
  }
}
