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
import { UploadService } from "./upload.service";

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
  _errors = {};
  errors = new BehaviorSubject<any>({});
  filesForUpload = new Subject<TransfersWithErrorInfo[]>();

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
        console.log("event:", event);
        if (this.autoupload && event.type === "filesSubmitted") {
          await this.uploadService.updateAuthenticationToken(
            <flowjs.FlowFile[]>event.event[0]
          );
          this.flow.upload();
        } else if (event.type === "fileError") {
          this._errors[(<flowjs.FlowFile>event.event[0]).uniqueIdentifier] =
            JSON.parse(<string>event.event[1]);
          this.errors.next(this._errors);
        } else if (event.type === "fileSuccess") {
          const messageSuccess = event.event[1]
            ? JSON.parse(<string>event.event[1])
            : "OK";
          this._errors[(<flowjs.FlowFile>event.event[0]).uniqueIdentifier] =
            null;
          this.errors.next(this._errors);
          this.complete.next(messageSuccess);
        }
      } catch (e) {
        console.error("Error uploading file", e);
        throw new IgeError(e);
      }
    });
  }

  isDragged = false; // new BehaviorSubject<boolean>(false);
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
  }
}
