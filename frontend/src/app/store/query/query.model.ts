export interface Query {
  id?: string;
  name: string;
  description: string;
  modified?: any;
}

export interface SqlQuery extends Query {
  type: 'sql';
  sql: string;
}

export interface FacetQuery extends Query {
  type: 'facet';
  term: string;
  model: any;
  parameter: any;
}
