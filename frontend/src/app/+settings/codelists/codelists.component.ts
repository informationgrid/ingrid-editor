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
import { Component, OnInit } from "@angular/core";
import {
  CodelistService,
  SelectOptionUi,
} from "../../services/codelist/codelist.service";
import { finalize, map, tap } from "rxjs/operators";
import { UntilDestroy } from "@ngneat/until-destroy";
import { Codelist } from "../../store/codelist/codelist.model";
import { CodelistQuery } from "../../store/codelist/codelist.query";
import { MatSnackBar } from "@angular/material/snack-bar";
import { toSignal } from "@angular/core/rxjs-interop";

@UntilDestroy()
@Component({
  selector: "ige-codelists",
  templateUrl: "./codelists.component.html",
  styleUrls: ["./codelists.component.scss"],
})
export class CodelistsComponent implements OnInit {
  codelists = toSignal(
    this.codelistQuery.selectAll().pipe(
      map((codelists) => this.codelistService.mapToOptions(codelists)),
      map((codelists) =>
        codelists.map((item) => {
          item.label = this.codelistLabelFormat(item);
          return item;
        }),
      ),
    ),
  );

  disableSyncButton = false;
  showMore = false;
  selectedCodelist: Codelist;

  constructor(
    private codelistService: CodelistService,
    private codelistQuery: CodelistQuery,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.codelistService.getAll();
  }

  updateCodelists() {
    this.disableSyncButton = true;
    this.codelistService
      .update()
      .pipe(
        tap(() => this.snack.open("Codelisten erfolgreich synchronisiert")),
        finalize(() => (this.disableSyncButton = false)),
      )
      .subscribe();
  }

  updateCodelistSelection(option: SelectOptionUi) {
    if (!option) {
      this.selectedCodelist = null;
      return;
    }

    this.selectedCodelist = this.codelistQuery.getEntity(option.value);
  }

  resetInput() {
    this.updateCodelistSelection(null);
  }

  codelistLabelFormat(option: SelectOptionUi) {
    return `${option.value} - ${option.label}`;
  }
}
