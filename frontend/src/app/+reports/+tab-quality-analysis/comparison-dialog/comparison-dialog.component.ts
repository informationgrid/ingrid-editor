/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import {
  MatDivider,
  MatListOption,
  MatSelectionList,
} from "@angular/material/list";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatExpansionModule } from "@angular/material/expansion";
import { ScoreIndicatorComponent } from "../../../shared/score-indicator/score-indicator.component";
import { EvaluationResult } from "../../../services/ai-assistant/ai-assistant.service";

@Component({
  selector: "ige-comparison-dialog",
  templateUrl: "./comparison-dialog.component.html",
  styleUrls: ["./comparison-dialog.component.scss"],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatIconButton,
    MatIcon,
    ScoreIndicatorComponent,
    MatDivider,
    MatListOption,
    MatSelectionList,
    ReactiveFormsModule,
    MatExpansionModule,
  ],
})
export class ComparisonDialogComponent implements OnInit {
  result = signal<EvaluationResult>(undefined);
  evaluations = computed(() =>
    this.result().evaluations.filter((e) => e.suggestions?.length > 0),
  );

  formGroup = new FormGroup({});
  isExpanded = signal<Record<string, boolean>>({});

  constructor(
    public dialogRef: MatDialogRef<ComparisonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: EvaluationResult,
  ) {
    this.result.set(data);
    this.evaluations().forEach((evaluation) => {
      this.formGroup.addControl(
        evaluation.key,
        new FormControl([evaluation.suggestions[0]]),
      );
      this.isExpanded.update((state) => ({
        ...state,
        [evaluation.key]: false,
      }));
    });
  }
  ngOnInit() {}

  toggleExpansion(key: string) {
    this.isExpanded.update((state) => ({
      ...state,
      [key]: !state[key],
    }));
  }
}
