import {UpdateType} from './update-type.enum';

export interface DocMainInfo {
  _id: string,
  _profile?: string,
  _previousId?: string,
  _parent?: string
}

export interface UpdateDatasetInfo {
  type: UpdateType;
  data: DocMainInfo[];
}