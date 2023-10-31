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
