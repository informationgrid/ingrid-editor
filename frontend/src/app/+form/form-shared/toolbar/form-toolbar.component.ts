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
