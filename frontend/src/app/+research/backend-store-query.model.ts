export interface BackendStoreQuery {

  readonly id: string;
  readonly name: string;
  readonly category: 'facet' | 'sql';
  readonly description: string;
  readonly term: string;
  readonly model: any;
  readonly parameters: any;

}
