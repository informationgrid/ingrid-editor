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
import { Component, input, output } from "@angular/core";
import { FlowDirective, Transfer } from "@flowjs/ngx-flow";
import { TransfersWithErrorInfo } from "../TransferWithErrors";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatProgressBar } from "@angular/material/progress-bar";
import { DecimalPipe } from "@angular/common";
import { SizePipe } from "../../../directives/size.pipe";

@Component({
  selector: "ige-upload-item",
  templateUrl: "./upload-item.component.html",
  styleUrls: ["./upload-item.component.scss"],
  standalone: true,
  imports: [
    MatProgressSpinner,
    MatIcon,
    MatIconButton,
    MatProgressBar,
    MatButton,
    DecimalPipe,
    SizePipe,
  ],
})
export class UploadItemComponent {
  file = input<TransfersWithErrorInfo>();
  flow = input<FlowDirective>();
  showOnlyProgress = input<boolean>(false);
  enableFileUploadOverride = input<boolean>();
  enableFileUploadReuse = input<boolean>();
  enableFileUploadRename = input<boolean>();

  remove = output<string>();
  useExisting = output<Transfer>();
  retryUpload = output<any>();

  cancelFile() {
    this.file().transfer.flowFile.cancel();
    this.remove.emit(this.file().transfer.name);
  }

  pause() {
    this.flow().pauseFile(this.file().transfer);
  }

  resume() {
    this.flow().resumeFile(this.file().transfer);
  }

  overwrite() {
    this.retryUpload.emit({ replace: true });
  }

  rename() {
    this.retryUpload.emit({
      rename: true,
      altName: this.file().error.data.alt,
    });
  }

  retry() {
    this.retryUpload.emit({});
  }
}
