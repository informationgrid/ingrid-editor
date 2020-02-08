import {storiesOf} from '@storybook/angular';
import {FormFieldsModule} from '../../app/form-fields/form-fields.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../app/shared/shared.module';
import {BehaviorSubject, of} from 'rxjs';
import {TreeQuery} from '../../app/store/tree/tree.query';
import {TreeStore} from '../../app/store/tree/tree.store';
import {DocumentAbstract} from '../../app/store/document/document.model';

const imports = [
  MatInputModule, SharedModule,
  MatFormFieldModule,
  BrowserAnimationsModule,
  FormFieldsModule, ReactiveFormsModule
];

const data = new BehaviorSubject([
  {title: 'node 1', profile: 'AddressDoc', _id: '1', parent: null},
  {title: 'folder', profile: 'FOLDER', _id: '2', parent: null, hasChildren: true},
  {title: 'node 1.1', profile: 'AddressDoc', _id: '3', parent: '2'}
]);
const dataRoot = new BehaviorSubject([
  {title: 'root node 1', profile: 'AddressDoc', _id: '1', parent: null},
  {title: 'root folder 2', profile: 'FOLDER', _id: '2', parent: null, hasChildren: true},
  {title: 'root node 3', profile: 'AddressDoc', _id: '3', parent: null}
]);

const store = new TreeStore();
const query = new TreeQuery(store);

const docService = {
  addDocumentToStore: (value) => store.add(value),
  addExpandedNode: () => {},
  removeExpandedNode: () => {},
  getChildren: (parentId) => {
    return of([{
      title: 'my node 1',
      _hasChildren: true,
      _parent: '1',
      _profile: 'AddressDoc',
      id: '2',
      _state: 'W',
      icon: ''
    }] as DocumentAbstract[])
  }
};

store.set([{
  title: 'root 1',
  _hasChildren: true,
  _parent: null,
  _profile: 'FOLDER',
  id: '1',
  _state: 'W',
  icon: '',
  _modified: null
}]);

storiesOf('Tree', module)/*.add('empty', () => ({
  moduleMetadata: {
    imports
  },
  template: `<ige-tree [data]="data"></ige-tree>`,
  props: {
    data: of([])
  }
})).add('no folders', () => ({
  moduleMetadata: {
    imports
  },
  template: `<ige-tree [data]="data" [treeController]="controller" (reload)="doReload()"></ige-tree>`,
  props: {
    data: data,
    // @ts-ignore
    controller: new DocumentsTreeConfigure({getChildren: docService}, query),
    doReload: () => {
      data.next([
        {title: 'node 1X', profile: 'AddressDoc', _id: '1', parent: null},
        {title: 'folderX', profile: 'FOLDER', _id: '2', parent: null, hasChildren: true},
        {title: 'node 1.1X', profile: 'AddressDoc', _id: '3', parent: '2'}
      ] as TreeNode[]);
    }
  }
})).add('handle two trees with reload', () => ({
  moduleMetadata: {
    imports
  },
  template: `
    <ige-tree [data]="data" [showReloadButton]="true" (reload)="doReload()"></ige-tree>
    <hr>
    <ige-tree [data]="data" [showReloadButton]="true" (reload)="doReload2()"></ige-tree>
  `,
  props: {
    data: data,
    doReload: () => {
      data.next([
        {title: 'node 1X', profile: 'AddressDoc', _id: '1', parent: null},
        {title: 'folderX', profile: 'FOLDER', _id: '2', parent: null, hasChildren: true},
        {title: 'node 1.1X', profile: 'AddressDoc', _id: '3', parent: '2'}
      ] as TreeNode[]);
    },
    doReload2: () => {
      data.next([
        {title: 'node 1Y', profile: 'AddressDoc', _id: '1', parent: null},
        {title: 'folderY', profile: 'FOLDER', _id: '2', parent: null, hasChildren: true}
      ] as TreeNode[]);
    }
  }
})).add('disabled nodes', () => ({
  moduleMetadata: {
    imports
  },
  template: `<ige-tree [data]="data" [disabledCondition]="isDisabled"></ige-tree>`,
  props: {
    data: of([
      {title: 'folder 1', profile: 'FOLDER', _id: '1', parent: null, hasChildren: true},
      {title: 'node 1.1', profile: 'a', _id: '5', parent: '1', hasChildren: false},
      {title: 'folder 2', profile: 'FOLDER', _id: '2', parent: null, hasChildren: true},
      {title: 'folder 2.1', profile: 'FOLDER', _id: '3', parent: '2', hasChildren: true},
      {title: 'node 2.1.1', profile: 'a', _id: '4', parent: '3', hasChildren: false}
    ]),
    isDisabled: (node: TreeNode) => node.level > 0
  }
}))*/;
