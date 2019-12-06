import { ID } from '@datorama/akita';
import {DocumentState} from '../../models/ige-document';

export interface DocumentAbstract {
  id: ID;
  title: string;
  icon: string;
  _state: DocumentState;
  _profile: string;
  _parent: string;
  _hasChildren: boolean;

}

/**
 * A factory function that creates Document
 */
export function createDocument(params: Partial<DocumentAbstract>) {
  return {
    ...params
  } as DocumentAbstract;
}
