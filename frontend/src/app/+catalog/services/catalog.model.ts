export interface Catalog {
  id?: string;
  label?: string;
  description?: string;
  type?: string;
  adminUser?: string;
  created?: Date;
  modified?: Date;
  countDocuments?: number;
  lastDocModification?: Date;
}
