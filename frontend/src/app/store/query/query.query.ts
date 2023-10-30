import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { QueryState, QueryStore } from "./query.store";
import { Query } from "./query.model";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class QueryQuery extends QueryEntity<QueryState, Query> {
  searchSelect$ = this.select((state) => state.ui.search);
  sqlSelect$ = this.select((state) => state.ui.sql);

  catalogQueries$ = this.selectAll().pipe(
    map((queries) => queries.filter((query) => query.isCatalogQuery)),
    map(QueryQuery.sortByName),
  );

  userQueries$ = this.selectAll().pipe(
    map((queries) => queries.filter((query) => !query.isCatalogQuery)),
    map(QueryQuery.sortByName),
  );

  constructor(protected store: QueryStore) {
    super(store);
  }

  private static sortByName(queries: Query[]): Query[] {
    return queries.sort((a, b) => a.name.localeCompare(b.name));
  }
}
