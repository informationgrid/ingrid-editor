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
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { MatError } from "@angular/material/form-field";
import { MatButton } from "@angular/material/button";
import { NgTemplateOutlet } from "@angular/common";
import { MatTooltip } from "@angular/material/tooltip";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { TranslocoDirective } from "@ngneat/transloco";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "ige-add-button",
  templateUrl: "./add-button.component.html",
  styleUrls: ["./add-button.component.scss"],
  standalone: true,
  imports: [
    MatButton,
    NgTemplateOutlet,
    MatTooltip,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    TranslocoDirective,
    MatError,
    MatIcon,
  ],
})
export class AddButtonComponent implements OnInit {
  @Input() buttonType: "stroked" | "flat" | "menu" = "stroked";
  @Input() showRequiredError = false;
  @Input() showTitle = true;
  @Input() buttonTitle = "Hinzufügen";

  @Input() set options(value: any[]) {
    if (value) this._options = value;
  }

  // accessibility
  @Input() ariaLabelledBy: string;
  @ViewChild("matError") matError: ElementRef;

  @Output() add = new EventEmitter();

  _options: { key; value }[] = [];

  constructor() {}

  ngOnInit(): void {}
}
