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
import { Component, HostListener, inject, Input, OnInit } from "@angular/core";
import { animate, style, transition, trigger } from "@angular/animations";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { DocumentService } from "../../../../services/document/document.service";
import { MatDialog } from "@angular/material/dialog";
import { forkJoin, timer } from "rxjs";

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

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.jumpToCurrentError();
  }

  // shortcuts for accessibility
  @HostListener("window: keydown", ["$event"])
  hotKeys(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey) return;

    // CTRL + ALT + R (to previous error)
    if (event.code === "KeyR") {
      this.jumpToPreviousError();
      event.preventDefault();
    }

    // CTRL + ALT + W (to next error)
    if (event.code === "KeyW") {
      this.jumpToNextError();
      event.preventDefault();
    }
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
        ".mat-form-field-invalid,.form-error,ige-add-button mat-error",
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

    forkJoin([
      // wait for all dialogs being dismissed to prevent focus being placed outside of dialogs
      ...this.dialog.openDialogs.map((dialog) => dialog.afterClosed()),
      // run delayed, since in firefox the scrollIntoView function seems to get interrupted otherwise
      timer(300),
    ]).subscribe(
      () =>
        (<HTMLElement>(
          element?.querySelectorAll("input,textarea,mat-select,button")?.item(0)
        ))?.focus(),
    );
  }

  closeErrorView() {
    this.documentService.publishState$.next(false);
  }
}
