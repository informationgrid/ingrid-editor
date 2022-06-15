export interface BackendStoreQuery {
  readonly id: string;
  readonly name: string;
  readonly category: "facet" | "sql";
  readonly description: string;
  readonly global: boolean;
  readonly userId?: string;
  readonly modified?: any;
  readonly settings: {
    readonly term?: string;
    readonly model?: any;
    readonly parameters?: any;
    readonly sql?: any;
  };
}
