import { Component, ViewChild } from "@angular/core";
import { GetCapabilitiesService } from "./get-capabilities.service";
import { catchError, filter, finalize } from "rxjs/operators";
import { Observable, of } from "rxjs";
import {
  MatSelectionList,
  MatSelectionListChange,
} from "@angular/material/list";
import { MatDialogRef } from "@angular/material/dialog";
import { GetCapabilitiesAnalysis } from "./get-capabilities.model";

@Component({
  selector: "ige-get-capabilities-dialog",
  templateUrl: "./get-capabilities-dialog.component.html",
  styleUrls: ["./get-capabilities-dialog.component.scss"],
})
export class GetCapabilitiesDialogComponent {
  @ViewChild(MatSelectionList) selection: MatSelectionList;

  report: GetCapabilitiesAnalysis;
  error: string;
  isAnalyzing = false;
  allChecked = false;
  allowSubmit = false;

  constructor(
    private getCapService: GetCapabilitiesService,
    private dlg: MatDialogRef<GetCapabilitiesDialogComponent>
  ) {}

  analyze(url: string) {
    this.report = null;
    this.error = null;
    this.isAnalyzing = true;
    this.getCapService
      .analyze(url)
      .pipe(
        catchError((error) => this.handleError(error)),
        filter((report) => report !== null),
        finalize(() => (this.isAnalyzing = false))
      )
      .subscribe((report) => (this.report = report));
  }

  private handleError(error: any): Observable<null> {
    this.error = error.message;
    return of(null);
  }

  submit() {
    console.log(this.selection.selectedOptions.selected);
    const selectedValues = this.selection.selectedOptions.selected.map(
      (item) => item.value
    );
    const result = Object.fromEntries(
      Object.entries(this.report).filter(
        ([key]) => selectedValues.indexOf(key) !== -1
      )
    );
    this.dlg.close(result);
  }

  toggleAll(checked: boolean) {
    this.allChecked = checked;
    if (checked) this.selection.selectAll();
    else this.selection.deselectAll();
    this.handleSubmitState(this.selection.selectedOptions.selected.length);
  }

  selectionChange($event: MatSelectionListChange) {
    this.handleSubmitState($event.source.selectedOptions.selected.length);
  }

  private handleSubmitState(numOptions: number) {
    this.allowSubmit = numOptions > 0;
  }
}
