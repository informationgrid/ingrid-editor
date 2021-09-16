import { Component, OnInit } from "@angular/core";
import { SaveQueryDialogResponse } from "./save-query-dialog.response";

@Component({
  selector: "ige-save-query-dialog",
  templateUrl: "./save-query-dialog.component.html",
  styleUrls: ["./save-query-dialog.component.scss"],
})
export class SaveQueryDialogComponent implements OnInit {
  model: SaveQueryDialogResponse = {
    forCatalog: false,
  };

  constructor() {}

  ngOnInit(): void {}
}
