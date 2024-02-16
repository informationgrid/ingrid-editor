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
