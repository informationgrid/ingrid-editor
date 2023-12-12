import { Component, inject, OnInit } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
  Option,
  OptionListComponent,
} from "../../../shared/option-list/option-list.component";
import { ConfigService } from "../../../services/config/config.service";

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
  private allowForceOverwrite =
    inject(ConfigService).getConfiguration().allowOverwriteOnVersionConflict;
  options: Option[] = [
    { label: "Speichern abbrechen", value: "cancel" },
    { label: "Den Datensatz neu laden", value: "reload" },
  ];
  private forceOption = {
    label: "Trotzdem speichern und Änderungen vom anderen Benutzer verwerfen",
    value: "force",
  };
  choice: string;

  constructor() {
    if (this.allowForceOverwrite) {
      this.options.splice(1, null, this.forceOption);
    }
  }

  ngOnInit(): void {}
}
