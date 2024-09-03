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
import { Component, Input, OnInit } from "@angular/core";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { Router } from "@angular/router";
import { ConfigService } from "../../../services/config/config.service";
import { TranslocoDirective } from "@ngneat/transloco";
import { ActionButtonComponent } from "../../../shared/action-button/action-button.component";

@Component({
  selector: "dashboard-docs-header",
  templateUrl: "./dashboard-docs-header.component.html",
  styleUrls: ["./dashboard-docs-header.component.scss"],
  standalone: true,
  imports: [TranslocoDirective, ActionButtonComponent],
})
export class DashboardDocsHeaderComponent implements OnInit {
  @Input() canCreateDatasets: boolean;
  @Input() canImport: boolean;

  constructor(
    private docEvents: DocEventsService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  createNewFolder() {
    this.docEvents.sendEvent({ type: "CREATE_FOLDER" });
  }

  createNewDataset() {
    this.docEvents.sendEvent({ type: "NEW_DOC" });
  }

  importDataset() {
    this.router.navigate([`${ConfigService.catalogId}/importExport/import`]);
  }
}
