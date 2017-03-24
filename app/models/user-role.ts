export interface RoleAttribute {
  id: string;
  value: string;
}
export interface Role {
  id?: string;
  name?: string;
  pages?: string[];
  attributes?: RoleAttribute[];
}