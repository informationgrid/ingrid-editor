import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { QueryQuery } from "../../store/query/query.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "ige-tab-sql",
  templateUrl: "./tab-sql.component.html",
  styleUrls: ["./tab-sql.component.scss"],
})
export class TabSqlComponent implements OnInit {
  sql: string;

  @Output() query = new EventEmitter();
  @Output() save = new EventEmitter();

  sqlExamples = [
    {
      label: 'Adressen, mit Titel "test"',
      value: `SELECT document1.*, document_wrapper.*
            FROM document_wrapper
                   JOIN document document1 ON
              CASE
                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                ELSE document_wrapper.draft = document1.id
                END
            WHERE document_wrapper.category = 'address'
              AND LOWER(title) LIKE '%test%'`,
    },
    {
      label: 'Dokumente "Luft- und Raumfahrt"',
      value: `SELECT document1.*, document_wrapper.*
            FROM document_wrapper
                   JOIN document document1 ON
              CASE
                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                ELSE document_wrapper.draft = document1.id
                END
            WHERE document1.type = 'mCloudDoc'
              AND data -> 'mCloudCategories' @> '"aviation"'`,
    },
  ];

  constructor(private queryQuery: QueryQuery) {}

  ngOnInit(): void {
    // init to last session state
    const state = this.queryQuery.getValue().ui.sql;
    this.sql = state.query;

    this.queryQuery.sqlSelect$.pipe(untilDestroyed(this)).subscribe((state) => {
      this.sql = state.query;
    });
  }
}
