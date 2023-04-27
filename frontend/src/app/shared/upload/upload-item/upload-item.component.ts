import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FlowDirective, Transfer } from "@flowjs/ngx-flow";
import { TransfersWithErrorInfo } from "../TransferWithErrors";

@Component({
  selector: "ige-upload-item",
  templateUrl: "./upload-item.component.html",
  styleUrls: ["./upload-item.component.scss"],
})
export class UploadItemComponent implements OnInit {
  @Input() file: TransfersWithErrorInfo;
  @Input() flow: FlowDirective;
  @Input() showOnlyProgress = false;

  @Output() remove = new EventEmitter<string>();
  @Output() useExisting = new EventEmitter<Transfer>();
  @Output() retryUpload = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  cancelFile() {
    this.file.transfer.flowFile.cancel();
    this.remove.next(this.file.transfer.name);
  }

  pause() {
    this.flow.pauseFile(this.file.transfer);
  }

  resume() {
    this.flow.resumeFile(this.file.transfer);
  }

  overwrite() {
    this.retryUpload.next({ replace: true });
  }

  rename() {
    this.retryUpload.next({ rename: true, altName: this.file.error.data.alt });
  }

  retry() {
    this.retryUpload.next({});
  }
}
