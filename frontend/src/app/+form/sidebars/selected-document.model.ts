export interface SelectedDocument {
  id: string;
  label: string;
  profile: string;
  state?: string;
  editable?: boolean;
  _parent?: string;
  forceLoad?: boolean;
}
