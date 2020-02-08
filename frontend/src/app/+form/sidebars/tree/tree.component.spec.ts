import {TreeComponent} from './tree.component';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTreeModule} from '@angular/material/tree';
import {createComponentFactory, Spectator, SpyObject} from '@ngneat/spectator';
import {
  childDocuments1,
  deeplyNestedDocumentsLevel1,
  deeplyNestedDocumentsLevel2,
  deeplyNestedDocumentsLevel3,
  deeplyNestedDocumentsRoot,
  recentDocuments,
  rootDocumentsWithDifferentStates
} from '../../../_test-data/documents';
import {of, Subject} from 'rxjs';
import {TreeHeaderComponent} from './tree-header/tree-header.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormFieldsModule} from '../../../form-fields/form-fields.module';
import {fakeAsync, tick} from '@angular/core/testing';
import {UpdateType} from '../../../models/update-type.enum';
import {createDocument, DocumentAbstract} from '../../../store/document/document.model';
import {delay} from 'rxjs/operators';
import {DynamicDatabase} from './dynamic.database';

describe('TreeComponent', () => {

  let spectator: Spectator<TreeComponent>;
  let db: SpyObject<DynamicDatabase>;
  const createHost = createComponentFactory({
    component: TreeComponent,
    imports: [MatTreeModule, MatIconModule, MatDialogModule, MatButtonModule, MatSlideToggleModule, MatFormFieldModule, FormFieldsModule],
    declarations: [TreeHeaderComponent],
    componentMocks: [DynamicDatabase],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
    db = spectator.get(DynamicDatabase, true);
    db.initialData.and.returnValue(of(recentDocuments));
    db.treeUpdates = new Subject();
    // by default return no children when requested (can be overridden)
    db.getChildren.and.returnValue(of([]));
  });

  it('should create component', () => {
    // spectator = createHost(`<ige-tree></ige-tree>`);
    expect(spectator.component).toBeDefined();
  });

  it('should show root nodes on startup', () => {
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);
    nodeContainsTitle(0, 'Test Document 1');
    nodeContainsTitle(1, 'Test Document 2');
    nodeContainsTitle(2, 'Test Document 3');
  });

  it('should show no tree if documents have no profile info set', () => {
    db.initialData.and.returnValue(of([]));
    spectator.detectChanges();

    // find the title element in the DOM using a CSS selector
    hasNumberOfTreeNodes(0);
  });

  it('should add a new root node', fakeAsync(() => {
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);

    const doc = createDocument({id: '12345', _profile: 'A', title: 'new node', _state: 'W'});
    sendTreeEvent(UpdateType.New, [doc]);

    hasNumberOfTreeNodes(4);
    expect(spectator.component.dataSource.data.length).toBe(4);
  }));

  it('should modify a root node', fakeAsync(() => {
    spectator.detectChanges();

    // add a new document via the storage service
    const doc = createDocument({id: '12345', _profile: 'A', title: 'initial node', _state: 'W'});
    sendTreeEvent(UpdateType.New, [doc]);
    hasNumberOfTreeNodes(4);
    nodeContainsTitle(0, 'initial node');

    // update document with a new id
    const docUpdate = createDocument({id: '12345', _profile: 'A', title: 'modified node', _state: 'W'});
    sendTreeEvent(UpdateType.Update, [docUpdate]);

    nodeContainsTitle(3, 'modified node');

  }));

  it('should delete a root node', fakeAsync(() => {
    spectator.detectChanges();

    // remove document via the storage service
    // @ts-ignore
    db.treeUpdates.next({type: UpdateType.Delete, data: [{id: '2'}]});

    // node with id '2' should be gone now
    hasNumberOfTreeNodes(2);
    const treeNode = spectator.component.dataSource.data;
    expect(treeNode[0]._id).toBe('1');
    expect(treeNode[1]._id).toBe('3');
  }));

  it('should add a new child node', fakeAsync(() => {
    spectator.detectChanges();

    // add a new document via the storage service
    const doc = createDocument({id: '12345', _profile: 'A', title: 'child', _state: 'W'});
    sendTreeEvent(UpdateType.New, [doc], '3');
    // children.push(doc);

    // tree node should be expanded and show new node
    hasNumberOfTreeNodes(4);

    // when collapsing node then child should disappear
    selectNode(2);

    hasNumberOfTreeNodes(3);

  }));

  it('should modify a child node', fakeAsync(() => {
    spectator.detectChanges();

    // add a new document and update it via the storage service
    const doc = createDocument({id: '12345', _profile: 'A', title: 'child node', _state: 'W'});
    sendTreeEvent(UpdateType.New, [doc], '3');

    // after changes to tree are visible, modify dataset
    const child = createDocument({id: '12345', _profile: 'A', title: 'modified child node', _state: 'W'});
    sendTreeEvent(UpdateType.Update, [child]);

    hasNumberOfTreeNodes(4);

    // check if correct node has been modified
    nodeContainsTitle(0, 'Test Document 1');
    nodeContainsTitle(1, 'Test Document 2');
    nodeContainsTitle(2, 'Test Document 3');
    nodeContainsTitle(3, 'modified child node');
  }));

  it('should delete a child node', fakeAsync(() => {
    spectator.detectChanges();

    // add a new document via the storage service
    const doc = createDocument({id: '12345', _profile: 'A', title: 'child node', _state: 'W'});
    sendTreeEvent(UpdateType.New, [doc], '3');

    hasNumberOfTreeNodes(4);

    // @ts-ignore
    sendTreeEvent(UpdateType.Delete, [{id: '12345'}]);

    hasNumberOfTreeNodes(3);

    // TODO: check if correct node has been removed
  }));

  it('should expand a node and load remote children', fakeAsync(() => {
    recentDocuments[0]._hasChildren = true;
    db.initialData.and.returnValue(of(recentDocuments));
    db.getChildren.and.returnValue(of(childDocuments1).pipe(delay(2000)));
    spectator.detectChanges();

    selectNode(0);

    hasNumberOfTreeNodes(3);

    tick(3000);

    hasNumberOfTreeNodes(5);
  }));

  it('should represent all states of a node (published, working, both)', fakeAsync(() => {
    db.initialData.and.returnValue(of(rootDocumentsWithDifferentStates));
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);
    nodeHasClass(0, 'published');
    nodeHasNotClass(0, 'working');
    nodeHasClass(1, 'working');
    nodeHasNotClass(1, 'published');
    nodeHasClass(2, 'workingWithPublished');
    nodeHasNotClass(2, 'working');
    nodeHasNotClass(2, 'published');
  }));

  it('should initially expand to a deeply nested node', fakeAsync(() => {
    db.initialData.and.returnValue(of(deeplyNestedDocumentsRoot));
    db.getChildren.and.callFake(id => {
      switch (id) {
        case '1':
          return of(deeplyNestedDocumentsLevel1);
        case '2':
          return of(deeplyNestedDocumentsLevel2);
        case '3':
          return of(deeplyNestedDocumentsLevel3);
        default:
          throw new Error('Unknown parent: ' + id);
      }
    });

    spectator.component.activeNodeId = '4';
    spectator.component.expandNodeIds = of(['1', '2', '3']).pipe(delay(0));
    spectator.detectChanges();

    tick();

    hasNumberOfTreeNodes(4);

    nodeIsExpanded(0);
    nodeIsExpanded(1);
    nodeIsExpanded(2);
    nodeContainsTitle(3, 'Nested Document');
    nodeIsSelected(3);

  }));

  xit('should reload the tree (nodes expanded state remembered?)', fakeAsync(() => {

  }));

  xit('should select multiple nodes and delete them at once', fakeAsync(() => {

  }));

  xit('should copy a root node to root', fakeAsync(() => {

  }));

  xit('should copy a root node to a folder', fakeAsync(() => {

  }));

  xit('should copy a child node to root', fakeAsync(() => {

  }));

  xit('should copy a whole tree/folder to root', fakeAsync(() => {

  }));

  xit('should not move a root node to root?', fakeAsync(() => {

  }));

  xit('should move a root node to a folder', fakeAsync(() => {

  }));

  xit('should move a child node to root', fakeAsync(() => {

  }));

  xit('should move a whole tree/folder to root', fakeAsync(() => {

  }));

  it('should select a node when clicking on it', fakeAsync(() => {
    db.initialData.and.returnValue(of(rootDocumentsWithDifferentStates));
    spectator.detectChanges();

    selectNode(0);
    nodeIsSelected(0);
    selectNode(1);
    nodeIsSelected(1);
    selectNode(2);
    nodeIsSelected(2);
  }));

  xit('should find a node by search', fakeAsync(() => {

  }));

  xit('should show no result info if search did not found anything', fakeAsync(() => {

  }));

  /*
   * Utility Functions
   */

  function hasNumberOfTreeNodes(num) {
    const nodes = spectator.queryAll('.mat-tree-node');
    expect(nodes.length).toBe(num);
  }

  function nodeContainsTitle(nodeIndex: number, title: string) {
    const nodes = spectator.queryAll('.mat-tree-node');
    expect(nodes[nodeIndex].textContent.trim()).toContain(title);
  }

  function selectNode(index: number) {
    const nodes = spectator.queryAll('.mat-tree-node');
    spectator.click(nodes[index]);
  }

  function sendTreeEvent(type: UpdateType, docs: DocumentAbstract[], parent?: string) {
    db.treeUpdates.next({type: type, data: docs, parent: parent});
  }

  function nodeHasClass(index: number, stateClass: string) {
    expect(spectator.queryAll('.mat-tree-node .mat-icon')[index]).toHaveClass(stateClass);
  }

  function nodeHasNotClass(index: number, stateClass: string) {
    expect(spectator.queryAll('.mat-tree-node .mat-icon')[index]).not.toHaveClass(stateClass);
  }

  function nodeIsExpanded(index: number) {
    expect(spectator.queryAll('.mat-tree-node')[index]).toHaveClass('expanded');
  }

  function nodeIsSelected(index: number) {
    expect(spectator.queryAll('.mat-tree-node')[index]).toHaveClass('active');
  }


});
