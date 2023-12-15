/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { DocumentAbstract } from "../store/document/document.model";

export const recentDocuments = <DocumentAbstract[]>[
  {
    id: 1,
    _type: "FOLDER",
    _parent: null,
    _state: "W",
    title: "Test Document 1",
  },
  {
    id: 2,
    _type: "FOLDER",
    _parent: null,
    _state: "W",
    title: "Test Document 2",
  },
  {
    id: 3,
    _type: "FOLDER",
    _parent: null,
    _state: "W",
    title: "Test Document 3",
  },
];

export const childDocuments1 = <DocumentAbstract[]>[
  {
    id: 10,
    _type: "ABC",
    _parent: 1,
    _state: "W",
    title: "Child Document 1",
  },
  {
    id: 11,
    _type: "ABC",
    _parent: 1,
    _state: "W",
    title: "Child Document 2",
  },
];

export const rootDocumentsWithDifferentStates = <DocumentAbstract[]>[
  {
    id: 1,
    _type: "ABC",
    _state: "P",
    title: "Document Published",
  },
  {
    id: 2,
    _type: "ABC",
    _state: "W",
    title: "Document Working",
  },
  {
    id: 3,
    _type: "ABC",
    _state: "PW",
    title: "Document Working with published version",
  },
];

export const deeplyNestedDocumentsRoot = <DocumentAbstract[]>[
  {
    id: 1,
    _type: "FOLDER",
    _hasChildren: true,
    title: "Root Folder",
  },
];

export const deeplyNestedDocumentsLevel1 = <DocumentAbstract[]>[
  {
    id: 2,
    _type: "FOLDER",
    _parent: 1,
    _hasChildren: true,
    title: "Sub Folder",
  },
];
export const deeplyNestedDocumentsLevel2 = <DocumentAbstract[]>[
  {
    id: 3,
    _type: "FOLDER",
    _parent: 2,
    _hasChildren: true,
    title: "Sub Sub Folder",
  },
];
export const deeplyNestedDocumentsLevel3 = <DocumentAbstract[]>[
  {
    id: 4,
    _type: "doc",
    _state: "W",
    _parent: 3,
    title: "Nested Document",
  },
];
