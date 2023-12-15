/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormToolbarService,
  Separator,
  ToolbarItem,
} from "./form-toolbar.service";
import { DocumentService } from "../../../services/document/document.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatMenuTrigger } from "@angular/material/menu";

@Component({
  selector: "form-toolbar",
  templateUrl: "./form-toolbar.component.html",
  styleUrls: ["./form-toolbar.component.scss"],
})
export class FormToolbarComponent implements OnInit {
  @ViewChild("hiddenMenuTrigger") hiddenMenuTrigger: MatMenuTrigger;
  buttons_left: Array<ToolbarItem | Separator> = [];
  buttons_right: Array<ToolbarItem | Separator> = [];

  menu = {};

  isNotReady = false;
  private currentFocusedEl: HTMLElement;

  constructor(
    private formToolbarService: FormToolbarService,
    private documentService: DocumentService,
  ) {
    formToolbarService.toolbar$.subscribe((buttons) => {
      this.buttons_left = buttons.filter((b) => b.align !== "right");
      this.buttons_right = buttons.filter((b) => b.align === "right");
    });
    this.documentService.documentOperationFinished$
      .pipe(takeUntilDestroyed())
      .subscribe((isReady) => {
        this.isNotReady = !isReady;
      });
  }

  ngOnInit() {}

  sendEvent(id: string, data?: any) {
    this.formToolbarService.sendEvent(id, data);
  }

  // restoring focus must be handled manually, because custom shortcut can also trigger button click event.
  saveCurrentFocus() {
    this.currentFocusedEl = document.activeElement as HTMLElement;
  }

  restoreFocus() {
    if (this.currentFocusedEl) this.currentFocusedEl.focus();
  }
}
