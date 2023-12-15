/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ige-job-handler-header",
  templateUrl: "./job-handler-header.component.html",
  styleUrls: ["./job-handler-header.component.scss"],
})
export class JobHandlerHeaderComponent {
  @Input() message;
  @Input() isRunning: boolean;
  @Input() set showMoreForce(value: boolean) {
    this.showMoreInternal = value;
  }

  @Output() showMore = new EventEmitter<boolean>();

  showMoreInternal = false;

  toggleShow() {
    this.showMoreInternal = !this.showMoreInternal;
    this.showMore.next(this.showMoreInternal);
  }
}
