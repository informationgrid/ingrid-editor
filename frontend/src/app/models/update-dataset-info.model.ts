import {UpdateType} from './update-type.enum';

export interface DocMainInfo {
  _id: string;
  _profile?: string;
  _parent?: string;
  [x: string]: any;
}

export interface UpdateDatasetInfo {
  type: UpdateType;
  data: DocMainInfo[];
}
