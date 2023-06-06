import { Component, inject, Input, OnInit } from "@angular/core";
import { animate, style, transition, trigger } from "@angular/animations";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { DocumentService } from "../../../../services/document/document.service";

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
  imports: [MatIconModule, MatButtonModule],
  standalone: true,
})
export class ErrorPanelComponent implements OnInit {
  @Input() numErrors = 0;

  currentError = 0;

  private specialElements = ["ige-add-button", "ige-formly-leaflet-type"];

  private documentService = inject(DocumentService);

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
    let element = document
      .querySelectorAll(
        ".mat-form-field-invalid,.form-error,ige-add-button mat-error"
      )
      .item(this.currentError);
    element?.scrollIntoView({ block: "center", behavior: "smooth" });

    const specialDomElement = element?.parentElement?.parentElement;
    if (this.specialElements.indexOf(specialDomElement?.localName) !== -1) {
      element = specialDomElement;
    } else {
      const tableElement = element?.parentElement?.parentElement?.parentElement;
      if (tableElement?.localName === "ige-table-type") {
        element = tableElement;
      }
    }

    // run delayed, since in firefox the scrollIntoView function seems to get interrupted otherwise
    setTimeout(
      () =>
        (<HTMLElement>(
          element?.querySelectorAll("input,textarea,mat-select,button")?.item(0)
        ))?.focus(),
      300
    );
  }

  closeErrorView() {
    this.documentService.publishState$.next(false);
  }
}
