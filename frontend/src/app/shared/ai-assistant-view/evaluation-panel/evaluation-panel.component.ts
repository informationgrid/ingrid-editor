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
import {
  Component,
  computed,
  effect,
  input,
  OnInit,
  signal,
} from "@angular/core";
import {
  AiAssistantService,
  EvaluationResult,
} from "../../../services/ai-assistant/ai-assistant.service";
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from "@angular/material/expansion";
import { MatButton } from "@angular/material/button";
import { MatDivider } from "@angular/material/list";
import { FormGroup } from "@angular/forms";
import { HintLoadingViewComponent } from "../../hint-loading-view/hint-loading-view.component";
import { EvaluationEntryComponent } from "./evaluation-entry/evaluation-entry.component";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "ige-evaluation-panel",
  templateUrl: "./evaluation-panel.component.html",
  styleUrls: ["./evaluation-panel.component.scss"],
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatButton,
    MatDivider,
    HintLoadingViewComponent,
    EvaluationEntryComponent,
    MatIcon,
  ],
})
export class EvaluationPanelComponent implements OnInit {
  form = input.required<FormGroup>();

  loadState = signal<"default" | "loading" | "loaded" | "error">("default");
  evaluationResult = signal<EvaluationResult>(undefined);
  evaluations = computed(() =>
    this.evaluationResult()?.evaluations.filter((e) => e.score < 6),
  );

  loadingHints = [
    "Ihre Angaben werden analysiert...",
    "Bitte haben Sie etwas Geduld...",
  ];

  constructor(private aiService: AiAssistantService) {}

  ngOnInit() {}

  evaluate() {
    this.loadState.set("loading");
    this.aiService.evaluateDataset(this.form().value).subscribe({
      next: (result) => this.evaluationResult.set(result),
      error: (error) => this.loadState.set("error"),
      complete: () => this.loadState.set("loaded"),
    });
  }

  protected onSuggestionApply(event: { key: string; value: any }) {
    this.form().patchValue({
      [event.key]: event.value,
    });
  }
}
