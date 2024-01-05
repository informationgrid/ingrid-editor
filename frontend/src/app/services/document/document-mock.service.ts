/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { IgeDocument } from "../../models/ige-document";
import { Observable, of } from "rxjs";

export class DocumentMockService {
  find(query: string): Observable<IgeDocument[]> {
    const doc1: IgeDocument = {
      _id: 1,
      _parent: null,
      _type: "UVP",
      _state: "W",
      _created: new Date().toDateString(),
      _modified: new Date().toDateString(),
      _contentModified: new Date().toDateString(),
      _hasChildren: false,
      title: "UVP Testdokument 1",
    };
    const doc2 = Object.assign({}, doc1);
    doc2._id = 2;
    doc2.title = "UVP Testdokument 2";

    return of([doc1, doc2]);
  }

  getChildren(parentId: string): Observable<any[]> {
    const doc1: IgeDocument = {
      _id: 1,
      _parent: null,
      _type: "UVP",
      _state: "W",
      _created: new Date().toDateString(),
      _modified: new Date().toDateString(),
      _contentModified: new Date().toDateString(),
      _hasChildren: false,
      title: "UVP Testdokument 1",
    };

    const doc2 = Object.assign({}, doc1);
    doc2._id = 2;
    doc2._hasChildren = true;
    doc2.title = "UVP Testdokument 2";

    const doc3 = Object.assign({}, doc1);
    doc3._id = 3;
    doc3.title = "UVP Testdokument 3";

    const doc4 = Object.assign({}, doc1);
    doc4._id = 4;
    doc4.title = "UVP Testdokument 4";

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
    const doc1: IgeDocument = {
      _id: 1,
      _parent: null,
      _type: "UVP",
      _state: "P",
      _created: new Date().toDateString(),
      _modified: new Date().toDateString(),
      _contentModified: new Date().toDateString(),
      _hasChildren: false,
      title: "UVP Testdokument 1",
    };
    const doc2 = Object.assign({}, doc1);
    doc2._id = 2;
    doc2.title = "UVP Testdokument 2";

    switch (id) {
      case "1":
        return of(doc1);
      case "2":
        return of(doc2);
    }
  }
}
