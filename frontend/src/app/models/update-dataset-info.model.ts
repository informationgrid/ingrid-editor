import { UpdateType } from "./update-type.enum";
import { IgeDocument } from "./ige-document";
import { DocumentAbstract } from "../store/document/document.model";

export interface DocMainInfo {
  _id: string;
  _profile?: string;
  _parent?: string;
  [x: string]: any;
}

export interface UpdateDatasetInfo {
  doNotSelect?: boolean;
  type: UpdateType;
  data: DocumentAbstract[];
  parent?: string;
  path?: string[];
}
