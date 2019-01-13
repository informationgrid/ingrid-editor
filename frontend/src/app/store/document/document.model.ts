import { ID } from '@datorama/akita';

export interface DocumentAbstract {
  id: ID;
  title: string;
  icon: string;
  _id: string;
  _profile: string;
  _children: DocumentAbstract[];
  _hasChildren: boolean;

}

/**
 * A factory function that creates Document
 */
export function createDocument(params: Partial<DocumentAbstract>) {
  return {

  } as DocumentAbstract;
}
