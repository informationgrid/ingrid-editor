export interface Query {
  id?: string;
  type?: 'facet' | 'sql';
  name: string;
  description: string;
  term: string;
  model: any;
  parameter: any;
}
