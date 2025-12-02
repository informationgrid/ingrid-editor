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
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormMessageService } from "../../../services/form-message.service";
import { animate, style, transition, trigger } from "@angular/animations";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NgClass } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";

export interface FormMessageType {
  severity: "info" | "error";
  message: string;
  duration?: number;
}

@UntilDestroy()
@Component({
  selector: "ige-form-message",
  templateUrl: "./form-message.component.html",
  styleUrls: ["./form-message.component.scss"],
  animations: [
    trigger("slideDown", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("300ms ease-in", style({ height: 48, opacity: 1 })),
      ]),
      transition(":leave", [
        style({ height: 48, opacity: 1 }),
        animate("300ms ease-out", style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
  imports: [NgClass, MatIcon, MatIconButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormMessageComponent implements OnInit {
  private messageService = inject(FormMessageService);

  types = signal<FormMessageType[]>([]);

  private defaultDuration = 3000;

  ngOnInit() {
    this.messageService.message$
      .pipe(untilDestroyed(this))
      .subscribe((type) => this.handleMessage(type));

    this.messageService.clearMessages$
      .pipe(untilDestroyed(this))
      .subscribe(() => this.resetAllMessages());
  }

  private handleMessage(type: FormMessageType) {
    this.types.update((types) => [...types, type]);

    if (type.severity === "info") {
      setTimeout(
        () => this.resetMessage(type),
        type.duration || this.defaultDuration,
      );
    }
  }

  resetMessage(type: FormMessageType) {
    this.types.update((types) => types.filter((t) => t !== type));
  }

  resetAllMessages() {
    this.types.set([]);
  }

  getIconClass(severity: "info" | "error") {
    switch (severity) {
      case "info":
        return "done";
      case "error":
        return "warning";
      default:
        throw new Error("Unknown severity: " + severity);
    }
  }
}
