import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime } from "rxjs/operators";

@UntilDestroy()
@Component({
  selector: "ige-select-csw-record-dialog",
  templateUrl: "./select-csw-record-dialog.html",
  styleUrls: ["./select-csw-record-dialog.scss"],
})
export class SelectCswRecordDialog implements OnInit {
  urlControl = new FormControl<string>("", Validators.required);

  ngOnInit(): void {
    this.urlControl.valueChanges
      .pipe(untilDestroyed(this), debounceTime(500))
      .subscribe((value) => this.analyzeUrl(value));
  }

  submit() {}

  private analyzeUrl(value: string) {
    console.log("analyze");
  }
}
