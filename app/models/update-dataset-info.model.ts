import {UpdateType} from './update-type.enum';

export interface UpdateDatasetInfo {
  type: UpdateType;
  data: any;
}