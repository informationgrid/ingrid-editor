import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { catchError, debounceTime, filter, tap } from "rxjs/operators";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  DocumentReferenceService,
  GetRecordAnalysis,
} from "../document-reference.service";
import { Observable, of } from "rxjs";
import { REGEX_URL } from "../../../input.validators";

export interface SelectCswRecordResponse {
  title: string;
  url: string;
  identifier: string;
  uuid: string;
}

@UntilDestroy()
@Component({
  selector: "ige-select-csw-record-dialog",
  templateUrl: "./select-csw-record-dialog.html",
  styleUrls: ["./select-csw-record-dialog.scss"],
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

  constructor(
    private dlg: MatDialogRef<SelectCswRecordResponse>,
    private docRefService: DocumentReferenceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.asAtomDownloadService = data.asAtomDownloadService === true;
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
