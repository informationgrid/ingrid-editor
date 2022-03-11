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
