import { Component, OnInit } from "@angular/core";
import {
  FormToolbarService,
  Separator,
  ToolbarItem,
} from "./form-toolbar.service";
import { DocumentService } from "../../../services/document/document.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "form-toolbar",
  templateUrl: "./form-toolbar.component.html",
  styleUrls: ["./form-toolbar.component.scss"],
})
export class FormToolbarComponent implements OnInit {
  buttons_left: Array<ToolbarItem | Separator> = [];
  buttons_right: Array<ToolbarItem | Separator> = [];

  menu = {};

  isNotReady = false;

  constructor(
    private formToolbarService: FormToolbarService,
    private documentService: DocumentService
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

  sendEvent(id: string) {
    this.formToolbarService.sendEvent(id);
  }
}
