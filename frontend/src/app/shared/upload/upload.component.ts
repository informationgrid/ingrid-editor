import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { FlowDirective, Transfer } from "@flowjs/ngx-flow";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { map, skip } from "rxjs/operators";
import { IgeError } from "../../models/ige-error";
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { TransfersWithErrorInfo } from "./TransferWithErrors";
import { UploadError, UploadService } from "./upload.service";

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
})
export class UploadComponent implements OnInit {
  /** Link text */
  @Input() text = "Datei auswählen ...";
  /** Name used in form which will be sent in HTTP request. */
  @Input() param = "file";
  /** Target URL for file uploading. */
  @Input() targetAnalyze;

  @Input() target: string = null;
  /** File extension that accepted, same as 'accept' of <input type="file" />.
   By the default, it's set to 'image/*'. */
  @Input() accept = "*.*";

  /** Allow multiple files to be uploaded */
  @Input() multiple = true;

  /* automatically upload files after drop/select */
  @Input() autoupload = true;

  /* hide everything except the progressed files */
  @Input() showOnlyProgress = false;

  @Output() complete = new EventEmitter<any>();
  @Output() chosenFiles = new EventEmitter<TransfersWithErrorInfo[]>();
  @Output() removeFile = new EventEmitter<string>();

  @ViewChild("flow") flow: FlowDirective;

  flowConfig: flowjs.FlowOptions;
  _errors: { [x: string]: UploadError } = {};
  errors = new BehaviorSubject<{ [x: string]: UploadError }>({});
  filesForUpload = new Subject<TransfersWithErrorInfo[]>();

  // parameters to send with the upload information
  private additionalParameters: any;

  constructor(private uploadService: UploadService) {}

  ngOnInit() {
    if (!this.target) {
      throw new IgeError(
        "Es wurde kein Ziel für die Upload Komponente angegeben. Bitte 'target' definieren."
      );
    }

    this.flowConfig = {
      target: this.target,
      testChunks: false,
      forceChunkSize: false,
    };
  }

  ngAfterViewInit() {
    combineLatest([this.errors, this.flow.transfers$])
      .pipe(
        untilDestroyed(this),
        skip(1), // do not use initial value
        map((result) =>
          result[1].transfers.map(
            (transfer) =>
              new TransfersWithErrorInfo(result[0][transfer.id], transfer)
          )
        )
      )
      .subscribe((result) => {
        this.filesForUpload.next(result);
        this.chosenFiles.next(result);
      });

    this.flow.events$.pipe(untilDestroyed(this)).subscribe(async (event) => {
      try {
        if (this.autoupload && event.type === "filesSubmitted") {
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
            event.event[2].xhr
          );
          const fileIdentifier = this.getFileIdentifier(event.event);
          this._errors[fileIdentifier] = null;
          this.errors.next(this._errors);
          this.complete.next(messageSuccess);
        }
      } catch (e) {
        console.error("Error uploading file", e);
        throw new IgeError(e);
      }
    });

    this.flow.flowJs.on("filesAdded", (files) => {
      const allowed = !files.some((file) => file.name.indexOf("%") !== -1);
      if (allowed) {
        return true;
      } else {
        throw new IgeError("Der Dateiname darf kein '%' enthalten!");
      }
    });
  }

  private resetParametersForSubmittedFiles(flowFiles: flowjs.FlowFile[]) {
    flowFiles.forEach(
      (file) => (file.flowObj.opts.query = { ...this.additionalParameters })
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
    this.complete.next();
  }

  setAdditionalUploadParameter(params: any) {
    this.additionalParameters = params;
    this.flow.flowJs.opts.query = params;
  }

  private handleUploadError(event: flowjs.FlowEventFromEventName<any>) {
    const errorResponse = event[2].xhr;

    const fileIdentifier = this.getFileIdentifier(event);

    const detail = this.getMessageFromResponse(errorResponse);

    this._errors[fileIdentifier] = new UploadError(
      errorResponse.status,
      detail.message ?? detail.errorText,
      detail.errorData ?? detail.errorId
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
        ...this.additionalParameters,
        ...parameter,
      };
    }
    flowFile.retry();
  }
}
