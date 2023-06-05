export interface Catalog {
  id?: string;
  label?: string;
  description?: string;
  type?: string;
  adminUser?: string;
  created?: string;
  modified?: string;
  countDocuments?: number;
  lastDocModification?: string;
  settings: Settings;
}

export interface Settings {
  config: CatalogSettingsConfig;
}

export interface CatalogSettingsConfig {
  atomDownloadUrl: string;
  namespace: string;
  partner: string;
  provider: string;
  elasticsearchAlias: string;
}
