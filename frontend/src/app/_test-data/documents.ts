import {DocumentAbstract} from '../store/document/document.model';

export const recentDocuments = <DocumentAbstract[]>[
  {
    id: '1',
    _profile: 'FOLDER',
    _parent: null,
    title: 'Test Document 1'
  },
  {
    id: '2',
    _profile: 'FOLDER',
    _parent: null,
    title: 'Test Document 2'
  },
  {
    id: '3',
    _profile: 'FOLDER',
    _parent: null,
    title: 'Test Document 3'
  }
];

export const childDocuments1 = <DocumentAbstract[]>[
  {
    id: '10',
    _profile: 'ABC',
    _parent: '1',
    title: 'Child Document 1'
  },
  {
    id: '11',
    _profile: 'ABC',
    _parent: '1',
    title: 'Child Document 2'
  }
];
