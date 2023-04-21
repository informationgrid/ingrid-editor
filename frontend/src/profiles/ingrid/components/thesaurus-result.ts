export interface ThesaurusResult {
  thesaurus: "INSPIRE-Themen" | "Umthes Schlagworte" | "Optionale Schlagworte";
  value: string;
  found: boolean;
  alreadyExists?: boolean;
}
