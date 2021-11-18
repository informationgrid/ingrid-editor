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
import { FlowDirective } from "@flowjs/ngx-flow";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { map, skip, tap } from "rxjs/operators";
import { IgeError } from "../../models/ige-error";
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { TransfersWithErrorInfo } from "./TransferWithErrors";

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

  @ViewChild("flow") flow: FlowDirective;

  flowConfig: flowjs.FlowOptions;
  _errors = {};
  errors = new BehaviorSubject<any>({});
  filesForUpload = new Subject<TransfersWithErrorInfo[]>();

  constructor() {}

  ngOnInit() {
    if (!this.target) {
      throw new IgeError(
        "Es wurde kein Ziel für die Upload Komponente angegeben. Bitte 'target' definieren."
      );
    }

    this.flowConfig = {
      target: this.target,
      testChunks: false,
    };
  }

  ngAfterViewInit() {
    combineLatest([this.errors, this.flow.transfers$])
      .pipe(
        untilDestroyed(this),
        tap((result) => {
          console.log("Error", result[0]);
          console.log("Transfers", result[1]);
        }),
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

    this.flow.events$.pipe(untilDestroyed(this)).subscribe((event) => {
      try {
        if (this.autoupload && event.type === "filesSubmitted") {
          this.flow.upload();
        } else if (event.type === "fileError") {
          console.log(event);
          const message = JSON.parse(<string>event.event[1]);
          console.log("Event:", message);
          this._errors[(<flowjs.FlowFile>event.event[0]).uniqueIdentifier] =
            message;
          this.errors.next(this._errors);
        } else if (event.type === "fileSuccess") {
          const message = JSON.parse(<string>event.event[1]);
          this.complete.next(message);
        } else {
          console.log("other event", event);
        }
      } catch (e) {
        console.error("Error uploading file", e);
      }
    });
    /*
        this.flow.transfers$
          .pipe(untilDestroyed(this))
          .subscribe((files) => (this.files = files.transfers));*/
  }

  /*  private _files: Transfer[] = [];

  get files(): Transfer[] {
    return this._files;
  }

  set files(value: Transfer[]) {
    this._files = value;
    this.chosenFiles.emit([...this._files]);
  }*/

  /** Allow you to add handler after its completion. Bubble up response text from remote. */

  /*  @Input() set droppedFiles(files: FileItem[]) {
    this.files = files;
    if (this.targetAnalyze) {
      // this.analyzeFiles();
    } else {
      // this.uploadFiles();
    }
  }*/

  /*
  onClick() {
    const fileUpload = this.htmlFileUpload.nativeElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files = [
          ...this.files,
          {
            data: file,
            state: "in",
            inProgress: false,
            progress: 0,
            canRetry: false,
            canCancel: true,
          },
        ];
      }
      if (this.targetAnalyze) {
        this.analyzeFiles();
      } else {
        this.uploadFiles();
      }
    };
    fileUpload.click();
  }
*/
  /*
  cancelFile(file: FileUploadModel) {
    file.sub.unsubscribe();
    this.removeFileFromArray(file);
  }

  retryFile(file: FileUploadModel) {
    this.uploadFile(file);
    file.canRetry = false;
  }

  removeFileFromArray(file: FileUploadModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  private uploadFiles() {
    const fileUpload = this.htmlFileUpload?.nativeElement;
    if (fileUpload) fileUpload.value = "";

    this.files.forEach((file) => {
      this.uploadFile(file);
    });
  }

  private uploadFile(file: FileUploadModel) {
    file.sub = this.uploadService
      .uploadFile(file, this.param, this.target)
      .subscribe((event: any) => {
        // this.removeFileFromArray(file);
        this.complete.emit(event.body);
      });
  }

  private analyzeFiles() {
    this.files.forEach((file) => this.analyzeFile(file));
  }

  private analyzeFile(file: FileUploadModel) {
    file.sub = this.uploadService
      .uploadFile(file, this.param, this.target + "/analyze")
      .pipe(
        catchError((error) => {
          file.error = error;
          return of({}); // throw new IgeError("Datei konnte nicht hochgeladen werden");
        })
      )
      .subscribe((event: any) => {
        this.analyzed.emit({
          file: file,
          analysis: event.body,
        });
      });
  }*/
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
}
