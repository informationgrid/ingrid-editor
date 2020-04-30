import {IgeDocument} from '../../models/ige-document';
import {Observable} from 'rxjs';

export abstract class DocumentBaseService {
  abstract find(query: string): Observable<IgeDocument[]>;
  abstract getChildren(parentId: string): Observable<IgeDocument[]>;
}
