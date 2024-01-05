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
