import {IgeDocument} from "../../models/ige-document";
import {Observable, of} from "rxjs";

export class DocumentMockService {

  find(query: string): Observable<IgeDocument[]> {
    let doc1: IgeDocument = {
      _id: '1',
      _parent: null,
      _profile: 'UVP',
      _state: 'W',
      _created: new Date().toDateString(),
      _modified: new Date().toDateString(),
      _hasChildren: false,
      title: 'UVP Testdokument 1'
    };
    let doc2 = Object.assign({}, doc1);
    doc2._id = '2';
    doc2.title = 'UVP Testdokument 2';

    return of([doc1, doc2]);
  }

  getChildren(parentId: string): Observable<any[]> {

    let doc1: IgeDocument = {
      _id: '1',
      _parent: null,
      _profile: 'UVP',
      _state: 'W',
      _created: new Date().toDateString(),
      _modified: new Date().toDateString(),
      _hasChildren: false,
      title: 'UVP Testdokument 1'
    };

    let doc2 = Object.assign({}, doc1);
    doc2._id = '2';
    doc2._hasChildren = true;
    doc2.title = 'UVP Testdokument 2';

    let doc3 = Object.assign({}, doc1);
    doc3._id = '3';
    doc3.title = 'UVP Testdokument 3';

    let doc4 = Object.assign({}, doc1);
    doc4._id = '4';
    doc4.title = 'UVP Testdokument 4';

    if (parentId === null) {
      return of([doc1, doc2]);
    } else if (parentId === "1") {
      return of([doc3]);
    } else if (parentId === "2") {
      return of([doc4]);
    } else {
      return of([]);
    }
  }

  load(id: string): Observable<IgeDocument> {
    let doc1: IgeDocument = {
      _id: '1',
      _parent: null,
      _profile: 'UVP',
      _state: 'P',
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
        return of(doc1);
      case '2':
        return of(doc2);
    }

  }

}
