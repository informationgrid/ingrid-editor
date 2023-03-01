import { UpdateType } from "./update-type.enum";
import { IgeDocument } from "./ige-document";
import { DocumentAbstract } from "../store/document/document.model";

export interface UpdateDatasetInfo {
  doNotSelect?: boolean;
  type: UpdateType;
  data: DocumentAbstract[];
  parent?: number;
  path?: number[];
}
