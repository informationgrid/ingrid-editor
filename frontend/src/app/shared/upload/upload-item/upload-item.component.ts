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
