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
import { Component, inject, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { diffLines } from "diff";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatButtonModule } from "@angular/material/button";

import { ExportService } from "../../../../app/services/export.service";
import { copyToClipboardFn } from "../../../../app/services/utils";
import { DialogTemplateModule } from "../../../../app/shared/dialog-template/dialog-template.module";
import { catchError, tap } from "rxjs/operators";
import { combineLatest, Observable, of } from "rxjs";
import { HttpResponse } from "@angular/common/http";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  templateUrl: "./iso-view.component.html",
  styleUrls: ["./iso-view.component.scss"],
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonToggleModule,
    MatButtonModule,
    DialogTemplateModule,
    MatProgressSpinner,
  ],
  standalone: true,
})
export class IsoViewComponent implements OnInit {
  isoText: string;
  isoTextPublished: string;
  isLoading = true;
  compareView = false;

  private exportService: ExportService = inject(ExportService);
  private copyToClipboardFn = copyToClipboardFn();

  constructor(
    public dialogRef: MatDialogRef<IsoViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    combineLatest([
      this.data.isoText as Observable<HttpResponse<Blob>>,
      (this.data.isoTextPublished as Observable<HttpResponse<Blob>>) ??
        of(null),
    ])
      .pipe(
        tap(() => (this.isLoading = false)),
        catchError(() => {
          this.dialogRef.close();
          throw new Error(
            "Probleme beim Erstellen der ISO-Ansicht. Bitte stellen Sie sicher, dass alle Pflichtfelder ausgefüllt sind.",
          );
        }),
      )
      .subscribe(async ([current, published]) => {
        this.isoText = await current.body.text();
        this.isoTextPublished = await published?.body.text();
        if (published) {
          this.calculateDiff();
        }
      });
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
    if (this.isoText)
      this.exportService.exportXml(this.isoText, {
        exportName: this.data.uuid,
      });
  }
}
