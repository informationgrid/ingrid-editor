import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime, filter, tap } from "rxjs/operators";
import { MatDialogRef } from "@angular/material/dialog";

@UntilDestroy()
@Component({
  selector: "ige-select-csw-record-dialog",
  templateUrl: "./select-csw-record-dialog.html",
  styleUrls: ["./select-csw-record-dialog.scss"],
})
export class SelectCswRecordDialog implements OnInit {
  urlControl = new FormControl<string>("https://", [
    Validators.required,
    Validators.pattern("(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"),
  ]);
  phase: "analyzing" | "valid" | "invalid";

  constructor(private dlg: MatDialogRef<any>) {}

  ngOnInit(): void {
    this.urlControl.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(500),
        filter((_) => this.urlControl.valid),
        tap((_) => (this.phase = "analyzing"))
      )
      .subscribe((value) => this.analyzeUrl(value));
  }

  submit() {
    this.dlg.close(this.urlControl.value);
  }

  private analyzeUrl(value: string) {
    console.log("analyze");
    setTimeout(() => (this.phase = "valid"), 2000);
  }
}
