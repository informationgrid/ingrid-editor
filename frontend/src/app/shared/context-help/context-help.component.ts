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
import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { Observable } from "rxjs";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "ige-context-help",
  templateUrl: "./context-help.component.html",
  styleUrls: ["./context-help.component.scss"],
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragHandle,
    MatIcon,
    MatDialogTitle,
    MatIconButton,
    MatDialogClose,
    CdkScrollable,
    MatDialogContent,
    AsyncPipe,
  ],
})
export class ContextHelpComponent implements OnInit, OnDestroy {
  @ViewChild("contextHelpContainer") container: ElementRef;

  title: string;
  description$: Observable<String> = this.data.description$;
  notResized = true;
  private timer: any;
  private initialDimension = {
    width: "",
    height: "",
  };

  constructor(
    public dialogRef: MatDialogRef<ContextHelpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.title = this.data.title ? this.data.title : "Kein Titel";
    this.timer = setInterval(() => this.checkSize(), 500);
  }

  checkSize() {
    let newHeight =
      this.container.nativeElement.parentElement.parentElement.style.height;
    let newWidth =
      this.container.nativeElement.parentElement.parentElement.style.width;
    if (
      this.initialDimension.width !== newWidth ||
      this.initialDimension.height !== newHeight
    ) {
      clearInterval(this.timer);
      this.notResized = false;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
