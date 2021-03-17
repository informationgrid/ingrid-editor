export interface SavedQuery {
  term: string;
  model: any;
  parameter: any;

}

export interface Query {
  id: string;
  type: string;
  title: string;
  description: string;
  definition: SavedQuery;
}
