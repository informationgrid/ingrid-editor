import { Component, Input, OnInit } from "@angular/core";
import { FlowDirective } from "@flowjs/ngx-flow";
import { TransfersWithErrorInfo } from "../TransferWithErrors";

@Component({
  selector: "ige-upload-item",
  templateUrl: "./upload-item.component.html",
  styleUrls: ["./upload-item.component.scss"],
})
export class UploadItemComponent implements OnInit {
  @Input() file: TransfersWithErrorInfo;
  @Input() flow: FlowDirective;

  constructor() {}

  ngOnInit(): void {}

  cancelFile() {
    this.file.transfer.flowFile.cancel();
  }

  pause() {
    this.flow.pauseFile(this.file.transfer);
  }

  resume() {
    this.flow.resumeFile(this.file.transfer);
  }

  overwrite() {
    this.file.transfer.flowFile.flowObj.opts.query = { replace: true };
    this.file.transfer.flowFile.retry();
  }

  rename() {
    this.file.transfer.flowFile.flowObj.opts.query = { replace: false };
    this.file.transfer.flowFile.retry();
  }

  useExisting() {
    // TODO: set query param
    this.file.transfer.flowFile.retry();
  }
}
