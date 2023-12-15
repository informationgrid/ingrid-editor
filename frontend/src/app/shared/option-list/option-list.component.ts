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
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatRadioModule } from "@angular/material/radio";
import { NgForOf, NgIf } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { FormsModule } from "@angular/forms";

export interface Option {
  label: string;
  value: string;
}

@Component({
  selector: "ige-option-list",
  templateUrl: "./option-list.component.html",
  styleUrls: ["./option-list.component.scss"],
  standalone: true,
  imports: [MatRadioModule, NgIf, NgForOf, MatDividerModule, FormsModule],
})
export class OptionListComponent implements OnInit {
  @Input() options: Option[];
  @Output() select = new EventEmitter<string>();

  selected: string;

  constructor() {}

  ngOnInit(): void {}

  onSelect(selected: string) {
    this.selected = selected;
    this.select.emit(selected);
  }
}
