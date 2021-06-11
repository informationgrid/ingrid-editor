export interface Codelist {
  id: string;
  name: string;
  description?: string;
  entries: CodelistEntry[];
  default: string;
}

export interface CodelistEntry {
  id: string;
  description: string;
  fields: Map<string, string>; // { [x: string]: string };
  data?: string;
}

export interface CodelistBackend {
  id: string;
  name: string;
  description?: string;
  defaultEntry?: string;
  entries: CodelistEntryBackend[];
  lastModified?: number;
}

export interface CodelistEntryBackend {
  id: string;
  description: string;
  localisations: any;
  data: string;
}
