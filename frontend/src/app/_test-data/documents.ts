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
