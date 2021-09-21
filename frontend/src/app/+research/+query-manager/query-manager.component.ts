import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { QueryQuery } from "../../store/query/query.query";
import { ResearchService } from "../research.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Query } from "../../store/query/query.model";
import { ConfigService } from "../../services/config/config.service";
import { Observable } from "rxjs";
import { MatSelectionList } from "@angular/material/list";
import { filter } from "rxjs/operators";

@Component({
  selector: "ige-query-manager",
  templateUrl: "./query-manager.component.html",
  styleUrls: ["./query-manager.component.scss"],
})
export class QueryManagerComponent implements OnInit {
  @Output() selection = new EventEmitter<string>();

  userQueries = this.queryQuery.userQueries$;
  catalogQueries = this.queryQuery.catalogQueries$;

  queryTypes: {
    label: string;
    queries: Observable<Query[]>;
    canDelete: boolean;
  }[];

  constructor(
    private queryQuery: QueryQuery,
    private dialog: MatDialog,
    private researchService: ResearchService,
    configService: ConfigService
  ) {
    this.queryTypes = [
      {
        label: "Globale Suchanfragen",
        queries: this.catalogQueries,
        canDelete: configService.isAdmin(),
      },
      {
        label: "Ihre Suchanfragen",
        queries: this.userQueries,
        canDelete: true,
      },
    ];
  }

  ngOnInit(): void {}

  removeQuery(id: string) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          message: `Möchten Sie die Anfrage wirklich löschen`,
          title: "Löschen",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Löschen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((result) => this.researchService.removeQuery(id).subscribe());
  }

  load(id: string, list: MatSelectionList) {
    this.selection.emit(id);

    // remove selection immediately
    list.deselectAll();
  }

  getIdentifier(index, item: Query) {
    return item.id;
  }
}
