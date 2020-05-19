export interface Codelist {
  id: string;
  entries: CodelistEntry[];
}

export interface CodelistEntry {
  id: string;
  value: string;
  data?: string;
}

export interface CodelistBackend {
  id: string;
  name: string;
  defaultEntry: string;
  entries: CodelistEntryBackend[],
  lastModified: number;
}

export interface CodelistEntryBackend {
  id: string;
  localisations: Array<Array<string>>;
}
