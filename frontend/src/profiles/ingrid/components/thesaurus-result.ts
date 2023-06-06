export interface ThesaurusResult {
  thesaurus:
    | "INSPIRE-Themen"
    | "Gemet Schlagworte"
    | "Umthes Schlagworte"
    | "Optionale Schlagworte";
  value: string;
  found: boolean;
  alreadyExists?: boolean;
}
