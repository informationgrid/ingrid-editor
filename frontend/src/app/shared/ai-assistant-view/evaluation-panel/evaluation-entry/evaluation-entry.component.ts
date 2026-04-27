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

import { Component, input, OnInit, output, signal } from "@angular/core";
import { Evaluation } from "../../../../services/ai/ai.service";
import { MatButton } from "@angular/material/button";
import {
  MatDivider,
  MatListOption,
  MatSelectionList,
} from "@angular/material/list";
import { ScoreIndicatorComponent } from "../../../score-indicator/score-indicator.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "ige-evaluation-entry",
  templateUrl: "./evaluation-entry.component.html",
  styleUrls: ["./evaluation-entry.component.scss"],
  imports: [
    MatButton,
    MatListOption,
    MatSelectionList,
    ScoreIndicatorComponent,
    ReactiveFormsModule,
    MatDivider,
  ],
})
export class EvaluationEntryComponent implements OnInit {
  evaluation = input.required<Evaluation>();

  onSuggestionApply = output<any>();
  onSuggestionReset = output<any>();

  formControl: FormControl;
  isExpanded = signal<boolean>(false);

  constructor() {}

  ngOnInit(): void {
    if (this.evaluation().suggestions?.length > 0) {
      this.formControl = new FormControl([this.evaluation().suggestions.at(0)]);
    }
  }

  toggleIsExpanded() {
    this.isExpanded.set(!this.isExpanded());
  }

  reset() {
    this.onSuggestionReset.emit(this.evaluation().key);
  }

  apply(value: any) {
    this.onSuggestionApply.emit({
      key: this.evaluation().key,
      value: value,
    });
  }
}
