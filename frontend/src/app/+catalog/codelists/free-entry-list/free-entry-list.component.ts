/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Component, input, OnInit, output } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FreeEntry } from "../../../store/codelist/codelist.model";
import { MatDivider, MatList, MatListItem } from "@angular/material/list";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";

@Component({
  selector: "ige-free-entry-list",
  templateUrl: "./free-entry-list.component.html",
  styleUrls: ["./free-entry-list.component.scss"],
  imports: [
    ReactiveFormsModule,
    MatList,
    MatListItem,
    MatIconButton,
    MatIcon,
    MatDivider,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
  ],
})
export class FreeEntryListComponent implements OnInit {
  freeEntries = input<FreeEntry[]>();

  onReplaceClicked = output<FreeEntry>();
  onAddClicked = output<FreeEntry>();

  ngOnInit(): void {}
}
