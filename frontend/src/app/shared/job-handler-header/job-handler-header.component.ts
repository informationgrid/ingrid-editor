/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Component, Input, input, output } from "@angular/core";
import { LogResult } from "../../+catalog/indexing/index.service";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatIconButton } from "@angular/material/button";
import { DatePipe } from "@angular/common";

@Component({
  selector: "ige-job-handler-header",
  templateUrl: "./job-handler-header.component.html",
  styleUrls: ["./job-handler-header.component.scss"],
  imports: [MatIcon, MatTooltip, MatProgressSpinner, MatIconButton, DatePipe],
})
export class JobHandlerHeaderComponent {
  readonly message = input<LogResult>(undefined);
  readonly isRunning = input<boolean>(undefined);
  @Input() set showMoreForce(value: boolean) {
    this.showMoreInternal = value;
  }

  readonly showMore = output<boolean>();

  showMoreInternal = false;

  toggleShow() {
    this.showMoreInternal = !this.showMoreInternal;
    this.showMore.emit(this.showMoreInternal);
  }
}
