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
import { Component, inject, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { diffLines } from "diff";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatButtonModule } from "@angular/material/button";
import { NgIf } from "@angular/common";
import { ExportService } from "../../../../app/services/export.service";
import { copyToClipboardFn } from "../../../../app/services/utils";
import { DialogTemplateModule } from "../../../../app/shared/dialog-template/dialog-template.module";

@Component({
  templateUrl: "./iso-view.component.html",
  styleUrls: ["./iso-view.component.scss"],
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonToggleModule,
    MatButtonModule,
    NgIf,
    DialogTemplateModule,
  ],
  standalone: true,
})
export class IsoViewComponent implements OnInit {
  isoText: any;
  isoTextPublished: any;
  compareView = false;

  private exportService: ExportService = inject(ExportService);
  private copyToClipboardFn = copyToClipboardFn();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    this.isoText = this.data.isoText;
    this.isoTextPublished = this.data.isoTextPublished;
    if (this.isoTextPublished) {
      this.calculateDiff();
    }
  }

  calculateDiff() {
    const diffs = diffLines(this.isoTextPublished, this.isoText);
    let pre = null;
    const diffView = document.getElementById("diffView"),
      fragment = document.createDocumentFragment();
    diffs.forEach((part) => {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? "green" : part.removed ? "red" : "grey";
      pre = document.createElement("pre");
      pre.style.color = color;
      pre.appendChild(document.createTextNode(part.value));
      fragment.appendChild(pre);
    });
    diffView.appendChild(fragment);
  }

  copy() {
    this.copyToClipboardFn(this.isoText);
  }

  download() {
    this.exportService.exportXml(this.isoText, { exportName: this.data.uuid });
  }
}
