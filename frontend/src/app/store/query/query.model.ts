import {FacetGroup} from '../../+research/research/research.service';

export interface Query {
  id: string;
  type: string;
  title: string;
  description: string;
  definition: FacetGroup
}
