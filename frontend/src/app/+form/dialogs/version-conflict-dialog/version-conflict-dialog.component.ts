/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
