import { Component, OnInit } from "@angular/core";

@Component({
  selector: "ige-valid-until-dialog",
  templateUrl: "./valid-until-dialog.component.html",
  styleUrls: ["./valid-until-dialog.component.scss"],
})
export class ValidUntilDialogComponent implements OnInit {
  private date: Date = null;

  constructor() {}

  ngOnInit(): void {}

  updateDate(value: any) {
    this.date = value;
  }

  getDate(): Date {
    return this.date;
  }
}
