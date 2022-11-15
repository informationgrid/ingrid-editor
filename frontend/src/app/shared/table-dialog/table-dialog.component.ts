import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "ige-table-dialog",
  templateUrl: "./table-dialog.component.html",
  styleUrls: ["./table-dialog.component.scss"],
})
export class TableDialogComponent implements OnInit {
  @Input() titleText: string;
  @Input() submitDisabled = false;

  @Output() submit = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
