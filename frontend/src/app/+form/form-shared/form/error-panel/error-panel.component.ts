import { Component, Input, OnInit } from "@angular/core";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: "ige-error-panel",
  templateUrl: "./error-panel.component.html",
  styleUrls: ["./error-panel.component.scss"],
  animations: [
    trigger("slideDown", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("500ms ease-in", style({ height: 36, opacity: 1 })),
      ]),
    ]),
  ],
})
export class ErrorPanelComponent implements OnInit {
  @Input() numErrors = 0;

  currentError = 0;

  ngOnInit() {
    this.jumpToCurrentError();
  }

  jumpToNextError() {
    this.currentError = (this.currentError + 1) % this.numErrors;
    this.jumpToCurrentError();
  }

  jumpToPreviousError() {
    this.currentError =
      this.currentError === 0 ? this.numErrors - 1 : this.currentError - 1;
    this.jumpToCurrentError();
  }

  private jumpToCurrentError() {
    document
      .querySelectorAll(
        ".mat-form-field-invalid,.form-error,ige-add-button mat-error"
      )
      .item(this.currentError)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}
