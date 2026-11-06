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
  input,
  output,
} from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from "@angular/material/card";

@Component({
  selector: "ige-ai-suggestion-panel",
  templateUrl: "./ai-suggestion-panel.component.html",
  styleUrls: ["./ai-suggestion-panel.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatIcon,
    MatIconButton,
    MatTooltip,
  ],
  host: {
    role: "region",
    "[attr.aria-busy]": "isLoading()",
    "aria-label": "KI-Vorschläge",
    "(keydown.escape)": "closed.emit()",
  },
})
export class AiSuggestionPanelComponent {
  isLoading = input<boolean>(true);
  hasError = input<boolean>(false);
  hasNoSuggestion = input<boolean>(false);

  closed = output<void>();
}
