export interface Query {
  type: string;
  id?: string;
  name: string;
  description: string;
  isCatalogQuery?: boolean;
  modified?: any;
}

export interface SqlQuery extends Query {
  type: "sql";
  sql: string;
}

export interface FacetQuery extends Query {
  type: "facet";
  model: any;
}
