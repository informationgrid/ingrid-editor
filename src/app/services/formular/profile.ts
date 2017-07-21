export interface Profile {
  profile: any[];
  getTitle: (doc: any) => string;
  getTitleFields: () => string[];

  treeIconClass?: string;
}
