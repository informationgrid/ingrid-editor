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
  _modified: any;
}

export const ADDRESS_ROOT_NODE: Partial<DocumentAbstract> = {
  id: null,
  title: 'Adressen',
  icon: 'Ordner',
  _state: 'P'
};

export const DOCUMENT_ROOT_NODE: Partial<DocumentAbstract> = {
  id: null,
  title: 'Daten',
  icon: 'Ordner',
  _state: 'P'
};


/**
 * A factory function that creates Document
 */
export function createDocument(params: Partial<DocumentAbstract>) {
  return {
    ...params
  } as DocumentAbstract;
}
