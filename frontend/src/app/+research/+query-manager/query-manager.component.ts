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
import { Component, computed, inject, OnInit, Signal } from "@angular/core";
import { ResearchService } from "../research.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Query, QueryUI } from "../../store/query/query.model";
import { ConfigService } from "../../services/config/config.service";
import { filter } from "rxjs/operators";
import { Router } from "@angular/router";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { CardBoxComponent } from "../../shared/card-box/card-box.component";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIconButton } from "@angular/material/button";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { DatePipe } from "@angular/common";
import { DateAgoPipe } from "../../directives/date-ago.pipe";
import { QueryStore } from "../../store/query/query.store";
import { SaveQueryDialogComponent } from "../save-query-dialog/save-query-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: "ige-query-manager",
    templateUrl: "./query-manager.component.html",
    styleUrls: ["./query-manager.component.scss"],
    imports: [
        PageTemplateComponent,
        CardBoxComponent,
        MatIcon,
        MatTooltip,
        MatIconButton,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        DatePipe,
        DateAgoPipe,
    ]
})
export class QueryManagerComponent implements OnInit {
  private queryStore = inject(QueryStore);
  private snackBar = inject(MatSnackBar);
  private researchService = inject(ResearchService);

  userQueries: Signal<QueryUI[]> = computed(() => {
    const queries = this.queryStore.userQueries();
    return QueryManagerComponent.addAllowDeleteInfo(queries);
  });

  catalogQueries: Signal<QueryUI[]> = computed(() => {
    const queries = this.queryStore.catalogQueries();
    let currentUserId = this.configService.$userInfo.value.login;
    return QueryManagerComponent.addAllowDeleteInfo(
      queries,
      (q: Query) =>
        this.configService.hasCatAdminRights() || q.userId === currentUserId,
    );
  });

  queryTypes: {
    label: string;
    queries: Signal<QueryUI[]>;
  }[];

  constructor(
    private router: Router,
    private dialog: MatDialog,
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
    let entity: Query = this.queryStore.entityMap()[id];

    this.researchService.setActiveQuery(id);

    this.router.navigate([
      entity.type === "facet"
        ? `${ConfigService.catalogId}/research/search`
        : `${ConfigService.catalogId}/research/sql`,
    ]);
  }

  private static addAllowDeleteInfo(
    queries: Query[],
    fn: (q: Query) => boolean = () => true,
  ): QueryUI[] {
    return queries.map((q: QueryUI) => {
      return {
        ...q,
        canDelete: fn(q),
      };
    });
  }

  editQuery(id: number) {
    this.dialog
      .open(SaveQueryDialogComponent, {
        hasBackdrop: true,
        maxWidth: 600,
        data: this.queryStore.entityMap()[id],
      })
      .afterClosed()
      .subscribe((dialogOptions) => {
        if (dialogOptions) {
          this.researchService.updateQuery(id, dialogOptions).subscribe(() =>
            this.snackBar.open(
              `Suche '${dialogOptions.name}' aktualisiert`,
              "",
              {
                panelClass: "green",
              },
            ),
          );
        }
      });
  }
}
