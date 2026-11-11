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
import { Component, computed, input, model } from "@angular/core";
import { MatListOption, MatSelectionList } from "@angular/material/list";
import { TextOptionComponent } from "./text-option/text-option.component";
import { ListOptionComponent } from "./list-option/list-option.component";
import { SpatialReferenceOptionComponent } from "./spatial-reference-option/spatial-reference-option.component";

/**
 * Single selection list of AI suggestions. Depending on the options it shows
 * plain texts, lists (as chips) or spatial references.
 */
@Component({
  selector: "ige-ai-suggestion-list",
  templateUrl: "./ai-suggestion-list.component.html",
  styleUrls: ["./ai-suggestion-list.component.scss"],
  imports: [
    MatSelectionList,
    MatListOption,
    TextOptionComponent,
    ListOptionComponent,
    SpatialReferenceOptionComponent,
  ],
})
export class AiSuggestionListComponent {
  /** The suggested values. */
  options = input.required<any[]>();
  /** The key of the field the options belong to. */
  key = input<string>();
  /** Show all options or only the selected one. */
  expanded = input<boolean>(true);
  /** The currently selected option. */
  selected = model<any>(null);

  visibleOptions = computed(() => {
    const options = this.options() ?? [];
    if (this.expanded()) return options;
    return [this.selected() ?? options.at(0)].filter((o) => o !== undefined);
  });

  hasListOptions = computed(() => Array.isArray(this.options()?.at(0)));

  hasSpatialReferenceOptions = computed(
    () => this.key() === "spatial.references",
  );
}
