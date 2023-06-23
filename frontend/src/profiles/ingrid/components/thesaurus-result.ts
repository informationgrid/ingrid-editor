export interface ThesaurusResult {
  thesaurus:
    | "INSPIRE-Themen"
    | "Gemet Schlagworte"
    | "Umthes Schlagworte"
    | "Freie Schlagworte";
  value: string;
  found: boolean;
  alreadyExists?: boolean;
}
