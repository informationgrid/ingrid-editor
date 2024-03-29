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
import { IgeDocument } from "../../../models/ige-document";
import { DocumentService } from "../../../services/document/document.service";

@Component({
  selector: "ige-publish-pending",
  templateUrl: "./publish-pending.component.html",
  styleUrls: ["./publish-pending.component.scss"],
})
export class PublishPendingComponent implements OnInit {
  @Input() doc: IgeDocument;
  @Input() forAddress: boolean;

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {}

  stopPublish() {
    this.documentService
      .cancelPendingPublishing(this.doc._id, this.forAddress)
      .subscribe();
  }
}
