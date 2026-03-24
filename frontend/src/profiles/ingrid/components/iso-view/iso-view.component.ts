/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import {
  Component,
  DestroyRef,
  effect,
  inject,
  Inject,
  signal,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { diffLines } from "diff";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";

import { saveAs } from "file-saver-es";
import { copyToClipboardFn } from "../../../../app/services/utils";

import { catchError, filter, map, tap } from "rxjs/operators";
import { combineLatest, of } from "rxjs";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import {
  ExchangeService,
  ExportTypeInfo,
} from "../../../../app/+importExport/exchange.service";

@Component({
  templateUrl: "./iso-view.component.html",
  styleUrls: ["./iso-view.component.scss"],
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinner,
    DialogTemplateComponent,
  ],
})
export class IsoViewComponent {
  exportedText = signal<string>(undefined);
  isoTextPublished = signal<string>(undefined);
  isLoading = signal<boolean>(true);
  compareView = signal<boolean>(false);
  exportNotSupported = signal<boolean>(true);

  private exchangeService: ExchangeService = inject(ExchangeService);
  exportFormats = toSignal(
    this.exchangeService
      .getExportTypes(true)
      .pipe(
        map((type) =>
          type.filter(
            (t) => this.data.availableExportFormats.indexOf(t.type) !== -1,
          ),
        ),
      ),
    {
      initialValue: [],
    },
  );
  selectedFormat = signal<ExportTypeInfo>(undefined);

  private copyToClipboardFn = copyToClipboardFn();
  private destroyRef = inject(DestroyRef);

  constructor(
    public dialogRef: MatDialogRef<IsoViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    effect(() => {
      const defaultFormat = this.data.defaultExportFormat;
      const formats = this.exportFormats();
      const initialFormat =
        formats.find((f) => f.type === defaultFormat) || formats[0];
      this.selectedFormat.set(initialFormat);
      this.loadExport(initialFormat);
    });
  }

  loadExport(format: ExportTypeInfo) {
    if (!format) return;
    this.isLoading.set(true);
    this.exportedText.set(undefined);
    this.isoTextPublished.set(undefined);
    this.exportNotSupported.set(false);
    const diffView = document.getElementById("diffView");
    if (diffView) {
      diffView.innerHTML = "";
    }

    const currentDocument = this.data.document;
    const options = {
      ids: [currentDocument.id as number],
      useDraft: true,
      exportFormat: format.type,
    };
    const optionsOnlyPublished = {
      ids: [currentDocument.id as number],
      useDraft: false,
      exportFormat: format.type,
    };

    combineLatest([
      this.exchangeService.export(options),
      currentDocument._state === "PW"
        ? this.exchangeService.export(optionsOnlyPublished)
        : of(null),
    ])
      .pipe(
        tap(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.isLoading.set(false);
          console.error("Error loading export", err);
          this.exportNotSupported.set(true);
          return of([null, null]);
        }),
      )
      .subscribe(async ([current, published]) => {
        if (current) {
          this.exportedText.set(await current.body.text());
        }
        if (published) {
          this.isoTextPublished.set(await published.body.text());
          this.calculateDiff();
        }
      });
  }

  onFormatChange(format: ExportTypeInfo) {
    this.selectedFormat.set(format);
    this.loadExport(format);
  }

  calculateDiff() {
    const diffs = diffLines(
      this.isoTextPublished() || "",
      this.exportedText() || "",
    );
    let pre = null;
    let diffView = document.getElementById("diffView");
    if (!diffView) return;
    diffView.innerHTML = "";
    const fragment = document.createDocumentFragment();
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
    this.copyToClipboardFn(this.exportedText());
  }

  download() {
    if (this.exportedText()) {
      const format = this.selectedFormat();
      const mimeType = format?.dataType || "text/xml";
      const fileExtension = format?.fileExtension || "xml";
      const blob = new Blob([this.exportedText()], { type: mimeType });
      saveAs(blob, `${this.data.uuid}.${fileExtension}`);
    }
  }
}
