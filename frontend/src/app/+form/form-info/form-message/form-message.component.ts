import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormMessageService } from "../../../services/form-message.service";
import { animate, style, transition, trigger } from "@angular/animations";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

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
})
export class FormMessageComponent implements OnInit {
  types: FormMessageType[] = [];

  private defaultDuration = 3000;

  constructor(
    private messageService: FormMessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.messageService.message$
      .pipe(untilDestroyed(this))
      .subscribe((type) => this.handleMessage(type));

    this.messageService.clearMessages$
      .pipe(untilDestroyed(this))
      .subscribe(() => this.resetAllMessages());
  }

  private handleMessage(type: FormMessageType) {
    this.types.push(type);

    if (type.severity === "info") {
      setTimeout(
        () => this.resetMessage(type),
        type.duration || this.defaultDuration,
      );
    }
    this.cdr.markForCheck();
  }

  resetMessage(type: FormMessageType) {
    this.types = this.types.filter((t) => t !== type);
    this.cdr.markForCheck();
  }

  resetAllMessages() {
    this.types = [];
    this.cdr.markForCheck();
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
