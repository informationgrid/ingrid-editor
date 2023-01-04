import { Component, Inject, OnInit } from "@angular/core";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { Observable } from "rxjs";
import { SelectOptionUi } from "../../../../services/codelist/codelist.service";
import { MatLegacyListOption as MatListOption } from "@angular/material/legacy-list";

export interface ChipDialogData {
  options: Observable<SelectOptionUi[]>;
  model: any[];
}

@Component({
  selector: "ige-chip-dialog",
  templateUrl: "./chip-dialog.component.html",
  styleUrls: ["./chip-dialog.component.scss"],
})
export class ChipDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ChipDialogData) {}

  ngOnInit(): void {}

  getSelection(selected: MatListOption[]) {
    return selected.map((item) => item.value);
  }
}
