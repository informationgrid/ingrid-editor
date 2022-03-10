import { Component, OnInit } from "@angular/core";
import { QueryQuery } from "../../store/query/query.query";
import { ResearchService } from "../research.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { FacetQuery, Query, SqlQuery } from "../../store/query/query.model";
import { ConfigService } from "../../services/config/config.service";
import { Observable } from "rxjs";
import { MatSelectionList } from "@angular/material/list";
import { filter } from "rxjs/operators";
import { logAction } from "@datorama/akita";
import { Router } from "@angular/router";

@Component({
  selector: "ige-query-manager",
  templateUrl: "./query-manager.component.html",
  styleUrls: ["./query-manager.component.scss"],
})
export class QueryManagerComponent implements OnInit {
  // @Output() selection = new EventEmitter<string>();

  userQueries = this.queryQuery.userQueries$;
  catalogQueries = this.queryQuery.catalogQueries$;

  queryTypes: {
    label: string;
    queries: Observable<Query[]>;
    canDelete: boolean;
  }[];

  constructor(
    private router: Router,
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

  ngOnInit(): void {
    this.researchService.fetchQueries();
  }

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
    this.loadQuery(id);

    // remove selection immediately
    list.deselectAll();
  }

  loadQuery(id: string) {
    let entity: SqlQuery | FacetQuery = JSON.parse(
      JSON.stringify(this.queryQuery.getEntity(id))
    );

    logAction("Load query");
    if (entity.type === "facet") {
      this.researchService.updateUIState({
        search: {
          category: (<FacetQuery>entity).model.type,
          query: (<FacetQuery>entity).term,
          facets: {
            model: {
              // ...this.getFacetModel(entity.model.type),
              ...(<FacetQuery>entity).model,
            },
            fieldsWithParameters: (<FacetQuery>entity).parameter ?? {},
          },
        },
      });
      this.router.navigate(["research/search"]);
    } else {
      this.researchService.updateUIState({
        sqlSearch: { query: (<SqlQuery>entity).sql },
      });
      this.router.navigate(["research/sql"]);
    }
  }

  private getFacetModel(type: string): any {
    return type === "selectDocuments"
      ? this.researchService.facetModel.documents
      : this.researchService.facetModel.addresses;
  }

  getIdentifier(index, item: Query) {
    return item.id;
  }
}
