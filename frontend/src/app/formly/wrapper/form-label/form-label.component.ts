/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
  ElementRef,
  input,
  output
} from "@angular/core";

import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "ige-form-label",
  templateUrl: "./form-label.component.html",
  styleUrls: ["./form-label.component.scss"],
  imports: [MatIconModule, MatTooltipModule],
})
export class FormLabelComponent {
  readonly fieldId = input<string>(undefined);
  readonly hasContextHelp = input(false);
  readonly ariaLabel = input<string>(undefined);

  readonly contextHelp = output<HTMLElement>();

  showContextHelp(evt: MouseEvent) {
    if (!this.hasContextHelp()) {
      return;
    }

    const target = new ElementRef(evt.currentTarget);
    const infoElement = target.nativeElement as HTMLElement;
    this.contextHelp.emit(infoElement);
  }
}
