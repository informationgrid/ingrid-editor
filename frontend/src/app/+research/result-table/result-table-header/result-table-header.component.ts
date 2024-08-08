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
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatDivider } from "@angular/material/divider";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "ige-result-table-header",
  templateUrl: "./result-table-header.component.html",
  styleUrls: ["./result-table-header.component.scss"],
  standalone: true,
  imports: [MatProgressSpinner, MatDivider, MatButton],
})
export class ResultTableHeaderComponent implements OnInit {
  @Input() isLoading = false;
  @Input() totalHits = 0;
  @Output() download = new EventEmitter<void>();
  @Input() showDownloadButton: boolean;

  ngOnInit(): void {
    this.showDownloadButton = this.showDownloadButton ?? this.download.observed;
  }
}
