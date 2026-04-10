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
import { Component, input } from "@angular/core";
import { MatAccordion } from "@angular/material/expansion";
import { MatDivider } from "@angular/material/list";
import { MatIcon } from "@angular/material/icon";
import { FormGroup } from "@angular/forms";
import { EvaluationPanelComponent } from "./evaluation-panel/evaluation-panel.component";
import { ValidatorPanelComponent } from "./validator-panel/validator-panel.component";

@Component({
  selector: "ige-ai-assistant-view",
  templateUrl: "./ai-assistant-view.component.html",
  styleUrls: ["./ai-assistant-view.component.scss"],
  imports: [
    MatAccordion,
    MatIcon,
    MatDivider,
    EvaluationPanelComponent,
    ValidatorPanelComponent,
  ],
})
export class AiAssistantViewComponent {
  metadata = input.required<any>();
  form = input.required<FormGroup>();

  constructor() {}
}
