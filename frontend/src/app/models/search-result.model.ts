import {DocumentAbstract} from '../store/document/document.model';

export interface SearchResult {
  totalHits: number;
  hits: DocumentAbstract[];
  size: number;
  page: number;
}
