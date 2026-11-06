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
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
} from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AiSuggestionPanelComponent } from "./ai-suggestion-panel/ai-suggestion-panel.component";
import { AiSuggestionListComponent } from "../../../shared/ai-suggestion-list/ai-suggestion-list.component";
import { PluginService } from "../../../services/plugin/plugin.service";
import { FormStateService } from "../../../+form/form-state.service";
import { MatButton } from "@angular/material/button";
import { Subscription } from "rxjs";
import {
  AiService,
  Evaluation,
  EvaluationResult,
} from "../../../services/ai/ai.service";

const AI_ASSISTANT_PLUGIN_ID = "plugin.show.ai-assistant";
const SUPPORTED_DOC_TYPES = ["InGridGeoDataset"];

/**
 * Adds a suggest button floating over the right side of a form field, which
 * is only visible while the field is hovered or focused. The button does not
 * take any space from the field.
 *
 * Usage: place the wrapper directly before "form-field", e.g.
 * `wrappers: ["panel", "ai-suggest", "form-field"]`
 */
@Component({
  selector: "ige-ai-suggest-wrapper",
  templateUrl: "./ai-suggest-wrapper.component.html",
  styleUrls: ["./ai-suggest-wrapper.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIcon,
    MatTooltip,
    MatButton,
    MatProgressSpinner,
    AiSuggestionPanelComponent,
    AiSuggestionListComponent,
  ],
  host: { "[class.panel-open]": "isPanelOpen()" },
})
export class AiSuggestWrapperComponent
  extends FieldWrapper
  implements OnDestroy
{
  private pluginService = inject(PluginService);
  private formStateService = inject(FormStateService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private aiService = inject(AiService);
  private loadSubscription: Subscription;

  // States of the component.
  isPanelOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  hasError = signal<boolean>(false);

  /** The evaluation of the whole dataset. */
  result = signal<EvaluationResult>(null);

  /** The evaluation of this field, null if the AI has nothing to say. */
  evaluation = computed<Evaluation>(
    () =>
      this.result()?.evaluations?.find((e) => e.key === this.aiFieldKey) ??
      null,
  );

  /** If no suggestions available for this field. */
  hasNoSuggestion = computed(() => !this.evaluation()?.options?.length);

  /** The option currently selected in the suggestion list. */
  selectedOption = signal<any>(null);

  /**
   * The value of the field before the first suggestion was applied. It is
   * wrapped, so that an empty original value can be restored as well.
   */
  private valueBeforeApply = signal<{ value: any } | null>(null);
  isApplied = computed(() => this.valueBeforeApply() !== null);

  /** The AI feature is enabled for the catalog and the document type. */
  isSupported = computed(() => {
    const aiPlugin = this.pluginService.plugins.find(
      (plugin) => plugin.id === AI_ASSISTANT_PLUGIN_ID,
    );
    return (
      (aiPlugin?.isActive() ?? false) &&
      SUPPORTED_DOC_TYPES.includes(this.formStateService.metadata()?.docType)
    );
  });

  ngOnDestroy() {
    this.loadSubscription?.unsubscribe();
  }

  /**
   * The key generated from the AI assistant.
   * It's formulated by the path of the field from the top of the form.
   * e.g. "lineage.statement".
   */
  private get aiFieldKey(): string {
    const keys: string[] = [];
    for (let field = this.field; field; field = field.parent) {
      if (field.key == null) continue;
      const key = Array.isArray(field.key) ? field.key : [field.key];
      keys.unshift(...key.map(String));
    }
    return keys.join(".");
  }

  suggest(event: MouseEvent) {
    event.stopPropagation();
    // the button toggles the panel
    if (this.isPanelOpen()) {
      this.closePanel();
      return;
    }

    this.isPanelOpen.set(true);
    this.loadResult();
  }

  private loadResult() {
    const uuid = this.formStateService.metadata()?.uuid;
    if (!uuid) {
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);
    this.result.set(null);

    this.loadSubscription?.unsubscribe();
    this.loadSubscription = this.aiService.getEvaluationResult(uuid).subscribe({
      next: (result) => {
        this.result.set(result);
        this.selectedOption.set(this.initialSelection());
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Preselect the option matching the current field value, e.g. a suggestion
   * applied before. Otherwise, preselect the first option.
   */
  private initialSelection(): any {
    const options = this.evaluation()?.options ?? [];
    return (
      options.find((option) => isEqual(option, this.formControl.value)) ??
      options.at(0) ??
      null
    );
  }

  /** The selected option is already the value of the field. */
  isSelectionApplied(): boolean {
    return isEqual(this.selectedOption(), this.formControl.value);
  }

  apply() {
    const selected = this.selectedOption();
    if (selected == null) return;

    // remember only the original value, also when applying several times
    if (!this.isApplied()) {
      this.valueBeforeApply.set({ value: this.formControl.value });
    }

    this.formControl.setValue(selected);
    this.formControl.markAsDirty();
  }

  reset() {
    const before = this.valueBeforeApply();
    if (!before) return;

    this.formControl.setValue(before.value);
    this.formControl.markAsDirty();
    this.valueBeforeApply.set(null);
  }

  closePanel() {
    this.loadSubscription?.unsubscribe();
    this.isPanelOpen.set(false);
    this.isLoading.set(false);
    this.hasError.set(false);

    // return focus to the field, so the user can continue editing
    setTimeout(() =>
      this.host.nativeElement
        .querySelector<HTMLElement>("input, textarea, select")
        ?.focus(),
    );
  }
}

/** Compare plain JSON values, e.g. texts, lists or spatial references. */
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
