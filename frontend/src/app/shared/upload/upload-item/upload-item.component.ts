import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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
  @Input() showOnlyProgress = false;

  @Output() remove = new EventEmitter<string>();

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
    this.retryWithParameter({ replace: true });
  }

  rename() {
    this.retryWithParameter({ replace: false });
  }

  useExisting() {
    // TODO: set query param
    this.retryWithParameter({});
  }

  private retryWithParameter(param: any) {
    this.file.transfer.flowFile.flowObj.opts.query = param;
    this.file.transfer.flowFile.retry();
    this.file.transfer.flowFile.flowObj.opts.query = {};
  }
}
