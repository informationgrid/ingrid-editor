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
import { Subscription } from "rxjs/Subscription";
import { UploadService } from "./upload.service";
import { ModalService } from "../../services/modal/modal.service";

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
  @Input() target = "/api/import";
  /** File extension that accepted, same as 'accept' of <input type="file" />.
   By the default, it's set to 'image/*'. */
  @Input() accept = "*.*";
  /** Allow you to add handler after its completion. Bubble up response text from remote. */

  @Input() set droppedFiles(files: FileUploadModel[]) {
    this.files = files;
    this.uploadFiles();
  }

  @Output() complete = new EventEmitter<string>();

  files: Array<FileUploadModel> = [];

  @ViewChild("fileUploadInput") htmlFileUpload: ElementRef;

  constructor(
    private uploadService: UploadService,
    private modalService: ModalService
  ) {}

  ngOnInit() {}

  onClick() {
    const fileUpload = this.htmlFileUpload.nativeElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({
          data: file,
          state: "in",
          inProgress: false,
          progress: 0,
          canRetry: false,
          canCancel: true,
        });
      }
      this.uploadFiles();
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
        this.removeFileFromArray(file);
        this.complete.emit(event.body);
      });
  }

  removeFileFromArray(file: FileUploadModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }
}

export class FileUploadModel {
  data: File;
  state: string;
  inProgress: boolean;
  progress: number;
  canRetry: boolean;
  canCancel: boolean;
  sub?: Subscription;
}
