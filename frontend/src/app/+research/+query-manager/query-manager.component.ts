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
import { QueryQuery } from "../../store/query/query.query";
import { ResearchService } from "../research.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Query, QueryUI } from "../../store/query/query.model";
import { ConfigService } from "../../services/config/config.service";
import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { logAction } from "@datorama/akita";
import { Router } from "@angular/router";

@Component({
  selector: "ige-query-manager",
  templateUrl: "./query-manager.component.html",
  styleUrls: ["./query-manager.component.scss"],
})
export class QueryManagerComponent implements OnInit {
  userQueries: Observable<QueryUI[]> = this.queryQuery.userQueries$.pipe(
    map((queries: QueryUI[]) =>
      QueryManagerComponent.addAllowDeleteInfo(queries),
    ),
  );
  catalogQueries = this.queryQuery.catalogQueries$.pipe(
    map((queries: QueryUI[]) => this.addDeleteInfo(queries)),
  );

  queryTypes: {
    label: string;
    queries: Observable<QueryUI[]>;
  }[];

  constructor(
    private router: Router,
    private queryQuery: QueryQuery,
    private dialog: MatDialog,
    private researchService: ResearchService,
    private configService: ConfigService,
  ) {
    this.queryTypes = [
      {
        label: "Globale Suchanfragen",
        queries: this.catalogQueries,
      },
      {
        label: "Ihre Suchanfragen",
        queries: this.userQueries,
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
        delayFocusTrap: true,
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe((result) => this.researchService.removeQuery(id).subscribe());
  }

  load(id: string) {
    this.loadQuery(id);
  }

  loadQuery(id: string) {
    let entity: Query = this.queryQuery.getEntity(id);

    this.researchService.setActiveQuery(id);

    logAction("Load query");
    this.router.navigate([
      entity.type === "facet"
        ? `${ConfigService.catalogId}/research/search`
        : `${ConfigService.catalogId}/research/sql`,
    ]);
  }

  getIdentifier(index, item: Query) {
    return item.id;
  }

  private addDeleteInfo(queries: QueryUI[]): QueryUI[] {
    let currentUserId = this.configService.$userInfo.value.login;
    return queries.map((q) => {
      return {
        ...q,
        canDelete:
          this.configService.hasCatAdminRights() || q.userId === currentUserId,
      };
    });
  }

  private static addAllowDeleteInfo(queries: QueryUI[]): QueryUI[] {
    return queries.map((q: QueryUI) => {
      return {
        ...q,
        canDelete: true,
      };
    });
  }
}
