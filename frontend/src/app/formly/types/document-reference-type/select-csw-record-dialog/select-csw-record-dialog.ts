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
import { Component, Inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { catchError, debounceTime, filter, tap } from "rxjs/operators";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  DocumentReferenceService,
  GetRecordAnalysis,
} from "../document-reference.service";
import { Observable, of } from "rxjs";
import { REGEX_URL } from "../../../input.validators";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { DialogTemplateComponent } from "../../../../shared/dialog-template/dialog-template.component";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FocusDirective } from "../../../../directives/focus.directive";
import { FormErrorComponent } from "../../../../+form/form-shared/ige-form-error/form-error.component";

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

@UntilDestroy()
@Component({
  selector: "ige-select-csw-record-dialog",
  templateUrl: "./select-csw-record-dialog.html",
  styleUrls: ["./select-csw-record-dialog.scss"],
  standalone: true,
  imports: [
    DialogTemplateComponent,
    FormlyModule,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    FocusDirective,
    MatError,
    FormErrorComponent,
  ],
})
export class SelectCswRecordDialog implements OnInit {
  urlControl = new FormControl<string>("https://", [
    Validators.required,
    Validators.pattern(REGEX_URL),
  ]);
  phase: "analyzing" | "valid" | "invalid";
  analysis: GetRecordAnalysis;
  analysisError = null;
  asAtomDownloadService: boolean;

  field: FormlyFieldConfig[] = [
    {
      key: "layerNames",
      type: "repeatList",
    },
  ];
  form = new FormGroup<any>({});
  model = { layerNames: [] };
  public showLayernames = false;

  constructor(
    private dlg: MatDialogRef<SelectCswRecordResponse>,
    private docRefService: DocumentReferenceService,
    @Inject(MAT_DIALOG_DATA) data: SelectCswRecordData,
  ) {
    this.asAtomDownloadService = data.asAtomDownloadService === true;
    this.model.layerNames = data.layerNames ?? [];
    if (data.url) setTimeout(() => this.urlControl.setValue(data.url));
    this.showLayernames = data.showLayernames;
  }

  ngOnInit(): void {
    this.urlControl.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(500),
        filter((_) => this.urlControl.valid),
        tap((_) => (this.phase = "analyzing")),
      )
      .subscribe((url) => this.analyzeUrl(url));
  }

  submit() {
    this.dlg.close(<SelectCswRecordResponse>{
      title: this.analysis.title,
      url: this.urlControl.value,
      identifier: this.analysis.identifier,
      uuid: this.analysis.uuid,
      layerNames: this.form.value.layerNames ?? [],
    });
  }

  private analyzeUrl(url: string) {
    this.analysisError = null;
    this.docRefService
      .analyzeGetRecordUrl(url)
      .pipe(catchError((err) => this.handleError(err)))
      .subscribe((response: GetRecordAnalysis) => {
        console.log(response);
        this.analysis = response;
        this.phase = response === null ? "invalid" : "valid";
        if (response !== null) {
          if (
            this.asAtomDownloadService &&
            response.downloadData.length === 0
          ) {
            this.phase = "invalid";
            this.analysisError =
              "Für ATOM-Download Dienste, müssen in dem externen Datensatz Download-Daten vorhanden sein.";
          } else this.phase = "valid";
        } else {
          this.phase = "invalid";
        }
      });
  }

  private handleError(err: any): Observable<null> {
    this.analysisError =
      "Die URL konnte nicht analysiert werden: " +
      (err.error?.errorText ?? "Unbekannter Fehler");
    return of(null);
  }
}
