import {
  Component,
  ElementRef,
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
import { UploadService } from "./upload.service";
import { UploadAnalysis } from "../import-export-service";
import { FileUploadModel } from "./fileUploadModel";
import { catchError } from "rxjs/operators";
import { IgeError } from "../../models/ige-error";
import { of } from "rxjs";

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

  @Input() target = "/api/import";
  /** File extension that accepted, same as 'accept' of <input type="file" />.
   By the default, it's set to 'image/*'. */
  @Input() accept = "*.*";

  /** Allow multiple files to be uploaded */
  @Input() multiple = true;

  @Output() analyzed = new EventEmitter<UploadAnalysis>();
  @Output() complete = new EventEmitter<string>();
  @Output() chosenFiles = new EventEmitter<FileUploadModel[]>();
  @ViewChild("fileUploadInput") htmlFileUpload: ElementRef;

  constructor(private uploadService: UploadService) {}

  private _files: FileUploadModel[] = [];

  get files(): FileUploadModel[] {
    return this._files;
  }

  set files(value: FileUploadModel[]) {
    this._files = value;
    this.chosenFiles.emit([...this._files]);
  }

  /** Allow you to add handler after its completion. Bubble up response text from remote. */

  @Input() set droppedFiles(files: FileUploadModel[]) {
    this.files = files;
    if (this.targetAnalyze) {
      this.analyzeFiles();
    } else {
      this.uploadFiles();
    }
  }

  ngOnInit() {}

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
  }
}
