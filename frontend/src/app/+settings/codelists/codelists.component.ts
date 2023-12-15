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
  CodelistService,
  SelectOptionUi,
} from "../../services/codelist/codelist.service";
import { throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { UntilDestroy } from "@ngneat/until-destroy";
import { IgeError } from "../../models/ige-error";
import { HttpErrorResponse } from "@angular/common/http";
import { Codelist } from "../../store/codelist/codelist.model";
import { CodelistQuery } from "../../store/codelist/codelist.query";

@UntilDestroy()
@Component({
  selector: "ige-codelists",
  templateUrl: "./codelists.component.html",
  styleUrls: ["./codelists.component.scss"],
})
export class CodelistsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  codelistDatasource = new MatTableDataSource([]);
  displayedColumns = ["id", "value", "data"];

  codelists = this.codelistQuery
    .selectAll()
    .pipe(map((codelists) => this.codelistService.mapToOptions(codelists)));

  disableSyncButton = false;
  showTable = false;
  showMore = false;
  selectedCodelist: Codelist;

  constructor(
    private codelistService: CodelistService,
    private codelistQuery: CodelistQuery,
  ) {}

  ngOnInit(): void {
    this.codelistService.getAll();
  }

  ngAfterViewInit() {
    this.codelistDatasource.sort = this.sort;
  }

  updateCodelists() {
    this.disableSyncButton = true;
    this.codelistService
      .update()
      .pipe(catchError((e) => this.handleSyncError(e)))
      .subscribe(() => (this.disableSyncButton = false));
  }

  private handleSyncError(e: HttpErrorResponse) {
    console.error(e);
    this.disableSyncButton = false;
    if (e.error.errorText === "Failed to synchronize code lists") {
      return throwError(
        new IgeError(
          "Die Codelisten konnten nicht synchronisiert werden. Überprüfen Sie die Verbindung zum Codelist-Repository.",
        ),
      );
    }
    return throwError(e);
  }

  updateCodelistTable(option: SelectOptionUi) {
    if (!option) {
      this.selectedCodelist = null;
      return;
    }

    this.selectedCodelist = this.codelistQuery.getEntity(option.value);
  }

  resetInput() {
    this.updateCodelistTable(null);
  }

  codelistLabelFormat(option: SelectOptionUi) {
    return `${option.value} - ${option.label}`;
  }
}
