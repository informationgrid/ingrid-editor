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
import {
  Component,
  DestroyRef,
  inject,
  Inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { catchError, debounceTime, filter, tap } from "rxjs/operators";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  DocumentReferenceService,
  GetRecordAnalysis,
} from "../document-reference.service";
import { Observable, of } from "rxjs";
import { REGEX_URL } from "../../../input.validators";
import { FormlyFieldConfig, FormlyForm } from "@ngx-formly/core";
import { DialogTemplateComponent } from "../../../../shared/dialog-template/dialog-template.component";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FocusDirective } from "../../../../directives/focus.directive";
import { FormErrorComponent } from "../../../../+form/form-shared/ige-form-error/form-error.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface SelectCswRecordResponse {
  title: string;
  url: string;
  identifier: string;
  uuid: string;
  layerNames: string[];
}

export interface SelectCswRecordData {
  asAtomDownloadService: boolean;
  layerNames: string[];
  url: string;
  showLayernames: boolean;
}

@Component({
  selector: "ige-select-csw-record-dialog",
  templateUrl: "./select-csw-record-dialog.html",
  styleUrls: ["./select-csw-record-dialog.scss"],
  imports: [
    DialogTemplateComponent,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    FocusDirective,
    MatError,
    FormErrorComponent,
    FormlyForm,
  ],
})
export class SelectCswRecordDialog implements OnInit {
  private destroyRef = inject(DestroyRef);

  urlControl = new FormControl<string>("https://", [
    Validators.required,
    Validators.pattern(REGEX_URL),
  ]);
  phase = signal<"analyzing" | "valid" | "invalid">(null);
  analysis = signal<GetRecordAnalysis>(null);
  analysisError = signal<any>(null);
  asAtomDownloadService = signal<boolean>(false);

  field: FormlyFieldConfig[] = [
    {
      key: "layerNames",
      type: "repeatList",
    },
  ];
  form = new FormGroup<any>({});
  model = { layerNames: [] };
  showLayernames = signal<boolean>(false);

  constructor(
    private dlg: MatDialogRef<SelectCswRecordResponse>,
    private docRefService: DocumentReferenceService,
    @Inject(MAT_DIALOG_DATA) data: SelectCswRecordData,
  ) {
    this.asAtomDownloadService.set(data.asAtomDownloadService === true);
    this.model.layerNames = data.layerNames ?? [];
    if (data.url) setTimeout(() => this.urlControl.setValue(data.url));
    this.showLayernames.set(data.showLayernames);
  }

  ngOnInit(): void {
    this.urlControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(500),
        filter((_) => this.urlControl.valid),
        tap((_) => this.phase.set("analyzing")),
      )
      .subscribe((url) => this.analyzeUrl(url));
  }

  submit() {
    this.dlg.close(<SelectCswRecordResponse>{
      title: this.analysis().title,
      url: this.urlControl.value,
      identifier: this.analysis().identifier,
      uuid: this.analysis().uuid,
      layerNames: this.form.value.layerNames ?? [],
    });
  }

  private analyzeUrl(url: string) {
    this.analysisError.set(null);
    this.docRefService
      .analyzeGetRecordUrl(url)
      .pipe(catchError((err) => this.handleError(err)))
      .subscribe((response: GetRecordAnalysis) => {
        this.analysis.set(response);
        this.phase.set(response === null ? "invalid" : "valid");
        if (response !== null) {
          if (
            this.asAtomDownloadService() &&
            response.downloadData.length === 0
          ) {
            this.phase.set("invalid");
            this.analysisError.set(
              "Für ATOM-Download Dienste, müssen in dem externen Datensatz Download-Daten vorhanden sein.",
            );
          } else this.phase.set("valid");
        } else {
          this.phase.set("invalid");
        }
      });
  }

  private handleError(err: any): Observable<null> {
    this.analysisError.set(
      "Die URL konnte nicht analysiert werden: " +
        (err.error?.errorText ?? "Unbekannter Fehler"),
    );
    return of(null);
  }
}
