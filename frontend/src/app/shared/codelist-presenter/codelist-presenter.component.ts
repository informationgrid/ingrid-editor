/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
  computed,
  input,
  OnInit,
  output,
  Signal,
} from "@angular/core";
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
})
export class CodelistPresenterComponent implements OnInit {
  codelist = input<Codelist>();
  hideMenu = input<boolean>(false);
  favoriteEntryIds = input<string[]>([]);

  remove = output<CodelistEntry>();
  setDefault = output<CodelistEntry>();
  edit = output<CodelistEntry>();
  asFavorite = output<CodelistEntry>();

  sortedEntries = computed(() => {
    return this.codelist().entries.sort((a, b) =>
      a.fields["de"]?.localeCompare(b.fields["de"]),
    );
  });
  showMore = {};
  entryFields: Signal<{ [x: string]: string[][] }> = computed(() => {
    return this.prepareEntryFields(this.codelist());
  });

  constructor() {}

  ngOnInit(): void {}

  private prepareEntryFields(entry: Codelist) {
    if (!entry) return;

    let entryFields = {};
    entry.entries.forEach((entry) => {
      entryFields[entry.id] = Object.keys(entry.fields).map((key) => [
        key,
        entry.fields[key],
      ]);
    });
    return entryFields;
  }
}
