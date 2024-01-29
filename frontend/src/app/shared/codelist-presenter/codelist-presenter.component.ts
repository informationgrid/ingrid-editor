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
import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { Codelist, CodelistEntry } from "../../store/codelist/codelist.model";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from "@angular/material/expansion";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatDivider } from "@angular/material/divider";
import { MatIconButton } from "@angular/material/button";

@Component({
  selector: "ige-codelist-presenter",
  templateUrl: "./codelist-presenter.component.html",
  styleUrls: ["./codelist-presenter.component.scss"],
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatIcon,
    MatExpansionPanelDescription,
    MatTooltip,
    MatMenuTrigger,
    MatMenu,
    MatDivider,
    MatIconButton,
    MatMenuItem,
  ],
  standalone: true,
})
export class CodelistPresenterComponent implements OnInit {
  _codelist: Codelist;
  @Input() set codelist(value: Codelist) {
    this._codelist = value;
    if (value) {
      this.prepareEntryFields(value);
    }
  }

  @Input() hideMenu = false;
  @Input() favoriteEntryIds: string[] = [];

  @Output() remove = new EventEmitter<CodelistEntry>();
  @Output() setDefault = new EventEmitter<CodelistEntry>();
  @Output() edit = new EventEmitter<CodelistEntry>();
  @Output() asFavorite = new EventEmitter<CodelistEntry>();

  showMore = {};
  entryFields: { [x: string]: string[][] } = {};

  constructor() {}

  ngOnInit(): void {}

  private prepareEntryFields(entry: Codelist) {
    entry.entries.forEach((entry) => {
      this.entryFields[entry.id] = Object.keys(entry.fields).map((key) => [
        key,
        entry.fields[key],
      ]);
    });
  }
}
