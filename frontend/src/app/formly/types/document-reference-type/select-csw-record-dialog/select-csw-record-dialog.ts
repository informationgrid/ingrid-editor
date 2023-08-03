import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { catchError, debounceTime, filter, tap } from "rxjs/operators";
import { MatDialogRef } from "@angular/material/dialog";
import {
  DocumentReferenceService,
  GetRecordAnalysis,
} from "../document-reference.service";
import { Observable, of } from "rxjs";

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
    Validators.pattern("(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})(/.*)?"),
  ]);
  phase: "analyzing" | "valid" | "invalid";
  analysis: GetRecordAnalysis;
  analysisError = null;

  constructor(
    private dlg: MatDialogRef<SelectCswRecordResponse>,
    private docRefService: DocumentReferenceService
  ) {}

  ngOnInit(): void {
    this.urlControl.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(500),
        filter((_) => this.urlControl.valid),
        tap((_) => (this.phase = "analyzing"))
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
      });
  }

  private handleError(err: any): Observable<null> {
    this.analysisError = err.error?.errorText ?? "Unbekannter Fehler";
    return of(null);
  }
}
