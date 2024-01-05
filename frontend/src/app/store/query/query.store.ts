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
import {
  ActiveState,
  EntityState,
  EntityStore,
  StoreConfig,
} from "@datorama/akita";
import { Query } from "./query.model";
import { FacetUpdate } from "../../+research/+facets/facets.component";

export interface QueryState extends EntityState<Query>, ActiveState {
  ui: {
    search: {
      category: "selectDocuments" | "selectAddresses";
      query: string;
      facets: FacetUpdate;
    };
    sql: {
      query: string;
    };
  };
}

export function createInitialState(): QueryState {
  return {
    active: null,
    ui: {
      search: {
        category: "selectDocuments",
        query: "",
        facets: {
          model: {},
          fieldsWithParameters: {},
        },
      },
      sql: {
        query: "",
      },
    },
  };
}

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "query" })
export class QueryStore extends EntityStore<QueryState, Query> {
  constructor() {
    super(createInitialState());
  }
}
