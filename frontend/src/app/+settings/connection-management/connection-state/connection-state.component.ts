/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

export interface ConnectionStateInfo {
  id: string;
  connected: boolean;
}

@Component({
  selector: "ige-connection-state",
  standalone: true,
  imports: [MatIcon, MatTooltip, MatProgressSpinner],
  templateUrl: "./connection-state.component.html",
  styleUrl: "./connection-state.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionStateComponent {
  connectionStates = input.required<ConnectionStateInfo[]>();
}
