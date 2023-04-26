import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "ige-table-dialog",
  templateUrl: "./table-dialog.component.html",
  styleUrls: ["./table-dialog.component.scss"],
})
export class TableDialogComponent implements OnInit {
  @Input() set isNew(value: boolean) {
    this.title = value ? "Eintrag hinzufügen" : "Eintrag bearbeiten";
  }
  @Input() submitDisabled = false;

  @Output() submit = new EventEmitter<void>();

  title: string;

  constructor() {}

  ngOnInit(): void {}
}
