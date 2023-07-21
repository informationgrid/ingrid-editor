import { Component, OnInit } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
  Option,
  OptionListComponent,
} from "../../../shared/option-list/option-list.component";

export type VersionConflictChoice = "cancel" | "force" | "reload";

@Component({
  selector: "ige-version-conflict-dialog",
  templateUrl: "./version-conflict-dialog.component.html",
  styleUrls: ["./version-conflict-dialog.component.scss"],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    OptionListComponent,
  ],
})
export class VersionConflictDialogComponent implements OnInit {
  options: Option[] = [
    { label: "Speichern abbrechen", value: "cancel" },
    {
      label: "Trotzdem speichern und Änderungen vom anderen Benutzer verwerfen",
      value: "force",
    },
    { label: "Den Datensatz neu laden", value: "reload" },
  ];
  choice: string;

  constructor() {}

  ngOnInit(): void {}
}
