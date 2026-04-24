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
  signal,
  untracked,
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
export class EvaluationPanelComponent {
  metadata = input.required<any>();
  form = input.required<FormGroup>();
  initialValues: Record<string, any> = {};

  // Load control.
  loadingUuid = signal<string>(null);
  loadingHints = [
    "Ihre Angaben werden analysiert...",
    "Bitte haben Sie etwas Geduld...",
  ];
  isIdle = computed(
    () => !this.loadingUuid() && !this.evaluationResult() && !this.hasError(),
  );
  isLoading = computed(() => this.loadingUuid() !== null);
  isLoaded = computed(() => !this.loadingUuid() && this.evaluationResult());
  hasError = signal<boolean>(false);

  // Evaluation result.
  evaluationResult = signal<EvaluationResult>(null);
  evaluations = computed(() =>
    this.evaluationResult()?.evaluations.filter(
      (e) => e.reasoning !== null || e.suggestions !== null,
    ),
  );

  // Only support InGridGeoDataset at the moment.
  isSupported = computed(() => {
    if (Object.keys(this.form().value).length === 0) return false;
    return this.metadata()?.docType === "InGridGeoDataset";
  });

  constructor(private aiService: AiAssistantService) {
    // Track uuid changes.
    effect(() => {
      this.loadResultFromReport(this.metadata()?.uuid);
      untracked(() => this.reset());
    });
  }

  // TODO: temporarily load report to show the evaluation result.
  loadResultFromReport(uuid: string) {
    if (!uuid) return;
    this.initialValues = { ...this.form().value };
    this.aiService.getLatestReport().subscribe({
      next: (report) => {
        const result = report?.data?.find((r) => r.uuid === uuid);
        if (result) this.evaluationResult.set(result);
      },
      error: (error) => {},
    });
  }

  private reset() {
    this.hasError.set(false);
    this.loadingUuid.set(null);
    this.evaluationResult.set(null);
  }

  evaluate() {
    this.reset();

    // Prepare data.
    const data = {
      ...this.form().value,
      uuid: this.metadata()?.uuid,
    };

    this.loadingUuid.set(this.metadata()?.uuid);
    this.aiService.evaluateDataset(data).subscribe({
      next: (result) => {
        if (this.loadingUuid() !== this.metadata()?.uuid) return;
        this.loadingUuid.set(null);
        this.evaluationResult.set(result);
      },
      error: (error) => {
        if (this.loadingUuid() !== this.metadata()?.uuid) return;
        this.loadingUuid.set(null);
        this.hasError.set(true);
      },
    });
  }

  protected onSuggestionReset(key: string) {
    this.form().patchValue({
      [key]: this.initialValues[key],
    });
  }

  protected onSuggestionApply(event: { key: string; value: any }) {
    this.form().patchValue({
      [event.key]: event.value,
    });
  }
}
