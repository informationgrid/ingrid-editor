import {DocumentState, IgeDocument} from "../../models/ige-document";
import {Observable} from "rxjs";
import {DocMainInfo} from "../../models/update-dataset-info.model";

export class DocumentMockService {

  find(query: string): Observable<IgeDocument[]> {
    let doc1: IgeDocument = {
      _id: '1',
      _parent: null,
      _profile: 'UVP',
      _state: DocumentState.W,
      _created: new Date().toDateString(),
      _modified: new Date().toDateString(),
      _hasChildren: false,
      title: 'UVP Testdokument 1'
    };
    let doc2 = Object.assign({}, doc1);
    doc2._id = '2';
    doc2.title = 'UVP Testdokument 2';

    return Observable.of([doc1, doc2]);
  }

  getChildren(parentId: string): Observable<any> {

    let doc1: IgeDocument = {
      _id: '1',
      _parent: null,
      _profile: 'UVP',
      _state: DocumentState.W,
      _created: new Date().toDateString(),
      _modified: new Date().toDateString(),
      _hasChildren: false,
      title: 'UVP Testdokument 1'
    };
    let doc2 = Object.assign({}, doc1);
    doc2._id = '2';
    doc2.title = 'UVP Testdokument 2';
    return Observable.of([doc1, doc2]);
  }

  load(id: string): Observable<DocMainInfo> {
    let doc1: DocMainInfo = {
      _id: '1',
      _parent: null,
      _profile: 'UVP',
      _state: DocumentState.P,
      _created: new Date().toDateString(),
      _modified: new Date().toDateString(),
      _hasChildren: false,
      title: 'UVP Testdokument 1'
    };
    let doc2 = Object.assign({}, doc1);
    doc2._id = '2';
    doc2.title = 'UVP Testdokument 2';

    switch (id) {
      case '1':
        return Observable.of(doc1);
      case '2':
        return Observable.of(doc2);
    }

  }

}
