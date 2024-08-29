/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { Component, Input } from "@angular/core";
import { of } from "rxjs";
import { ContextHelpService } from "../services/context-help/context-help.service";
import { ConfigService } from "../services/config/config.service";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "ige-help-context-button",
  template: `
    <button
      mat-icon-button
      class="hint"
      aria-haspopup="dialog"
      (click)="showHelpDialog()"
      matTooltip="Eingabehilfe"
    >
      <mat-icon class="material-icons-outlined" svgIcon="info-24px"></mat-icon>
    </button>
  `,
  standalone: true,
  imports: [MatIconButton, MatTooltip, MatIcon],
})
export class HelpContextButtonComponent {
  @Input() fieldId: string;
  @Input() description: string;
  @Input() label: string;
  @Input() docType: string = "all";

  constructor(
    private contextHelpService: ContextHelpService,
    private configService: ConfigService,
  ) {}

  showHelpDialog() {
    if (this.description) {
      this.contextHelpService.showContextHelpPopup(
        this.label,
        of(this.description),
      );
    } else {
      let profile = this.configService.$userInfo.getValue().currentCatalog.type;
      this.contextHelpService.showContextHelp(
        profile,
        this.docType,
        this.fieldId,
        this.label,
        null,
      );
    }
  }
}
