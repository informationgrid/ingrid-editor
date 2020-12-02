import {TreeComponent} from './tree.component';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
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
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {UntilDestroy} from '@ngneat/until-destroy';
import {EmptyNavigationComponent} from './empty-navigation/empty-navigation.component';
import {TreeNode} from '../../../store/tree/tree-node.model';
import {ReactiveFormsModule} from '@angular/forms';
import {FakeMatIconRegistry} from '@angular/material/icon/testing';
import {UpdateDatasetInfo} from '../../../models/update-dataset-info.model';
import {TreeStore} from '../../../store/tree/tree.store';
import {TreeQuery} from '../../../store/tree/tree.query';
import {MatCheckboxModule} from '@angular/material/checkbox';

function mapDocumentsToTreeNodes(docs: DocumentAbstract[], level: number) {
  return docs.map(doc =>
    new TreeNode(
      doc.id.toString(), doc.title, doc._type, doc._state, level, doc._hasChildren, doc._parent,
      doc.icon)
  );
}

describe('TreeComponent', () => {

  let spectator: Spectator<TreeComponent>;
  let db: SpyObject<DynamicDatabase>;
  const createHost = createComponentFactory({
    component: TreeComponent,
    imports: [MatTreeModule, MatIconModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatSlideToggleModule, ReactiveFormsModule,
      MatFormFieldModule, MatAutocompleteModule, FormFieldsModule],
    declarations: [TreeHeaderComponent, EmptyNavigationComponent],
    providers: [
      {provide: MatIconRegistry, useClass: FakeMatIconRegistry}
    ],
    componentMocks: [DynamicDatabase],
    detectChanges: false
  });

  beforeEach(() => {
    UntilDestroy()(TreeComponent);
    spectator = createHost();
    db = spectator.inject(DynamicDatabase, true);
    db.initialData.and.returnValue(of(recentDocuments));
    db.treeUpdates = new Subject();
    db.mapDocumentsToTreeNodes.andCallFake(mapDocumentsToTreeNodes);
    // by default return no children when requested (can be overridden)
    db.getChildren.and.returnValue(of([]));
  });

  it('should create component', () => {
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

    const doc = createDocument({id: '12345', _type: 'A', title: 'new node', _state: 'W'});
    sendTreeEvent(UpdateType.New, [doc]);

    hasNumberOfTreeNodes(4);
    expect(spectator.component.dataSource.data.length).toBe(4);
  }));

  it('should modify a root node', fakeAsync(() => {
    spectator.detectChanges();

    // add a new document via the storage service
    const doc = createDocument({id: '12345', _type: 'A', title: 'initial node', _state: 'W'});
    sendTreeEvent(UpdateType.New, [doc]);
    hasNumberOfTreeNodes(4);
    nodeContainsTitle(3, 'initial node');

    // update document with a new id
    const docUpdate = createDocument({id: '12345', _type: 'A', title: 'modified node', _state: 'W'});
    sendTreeEvent(UpdateType.Update, [docUpdate]);

    // new/modified node should be placed correctly (alphabetically)
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
    const newChildDocOf3: any = {id: '12345', _profile: 'A', title: 'child', _state: 'W', _parent: '3'};
    db.getChildren.and.callFake(id => {
      switch (id) {
        case '3':
          return of([newChildDocOf3]);
        default:
          throw new Error('Unknown parent: ' + id);
      }
    });
    spectator.detectChanges();

    // add a new document via the storage service
    const doc = createDocument(newChildDocOf3);
    sendTreeEvent(UpdateType.New, [doc], doc._parent);

    // tree node should be expanded and show new node
    hasNumberOfTreeNodes(4);

    // when collapsing node then child should disappear
    selectNode(2);

    hasNumberOfTreeNodes(3);

  }));

  it('should modify a child node', fakeAsync(() => {
    const newDoc: any = {id: '12345', _profile: 'A', title: 'child node', _state: 'W'};
    db.getChildren.and.callFake(id => {
      switch (id) {
        case '3':
          return of([newDoc]);
        default:
          throw new Error('Unknown parent: ' + id);
      }
    });
    spectator.detectChanges();

    // add a new document and update it via the storage service
    const doc = createDocument(newDoc);
    sendTreeEvent(UpdateType.New, [doc], '3');

    // after changes to tree are visible, modify dataset
    const child = createDocument({id: '12345', _type: 'A', title: 'modified child node', _state: 'W'});
    sendTreeEvent(UpdateType.Update, [child]);

    hasNumberOfTreeNodes(4);

    // check if correct node has been modified
    nodeContainsTitle(0, 'Test Document 1');
    nodeContainsTitle(1, 'Test Document 2');
    nodeContainsTitle(2, 'Test Document 3');
    nodeContainsTitle(3, 'modified child node');
  }));

  it('should delete a child node', fakeAsync(() => {
    const newDoc: any = {id: '12345', _profile: 'A', title: 'child node', _state: 'W'};
    db.getChildren.and.callFake(() => of([newDoc]));
    spectator.detectChanges();

    // add a new document and update it via the storage service
    const doc = createDocument(newDoc);
    sendTreeEvent(UpdateType.New, [doc], '3');

    hasNumberOfTreeNodes(4);

    // @ts-ignore
    sendTreeEvent(UpdateType.Delete, [{id: '12345'}]);

    hasNumberOfTreeNodes(3);

    // TODO: check if correct node has been removed
  }));

  it('should expand a node and load remote children', fakeAsync(() => {
    const modRececentDocs = [...recentDocuments];
    modRececentDocs[0]._hasChildren = true;
    db.initialData.and.returnValue(of(modRececentDocs));
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

    expect(nodeAtIndex(0)).toHaveClass('published');
    expect(nodeAtIndex(0)).not.toHaveClass('working');
    expect(nodeAtIndex(1)).toHaveClass('working');
    expect(nodeAtIndex(1)).not.toHaveClass('published');
    expect(nodeAtIndex(2)).toHaveClass('workingWithPublished');
    expect(nodeAtIndex(2)).not.toHaveClass('working');
    expect(nodeAtIndex(2)).not.toHaveClass('published');
  }));

  it('should initially expand to a deeply nested node', fakeAsync(() => {

    db.getPath.and.returnValue(Promise.resolve(['1', '2', '3']));
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
    spectator.component.expandNodeIds = new Subject<string[]>();
    setTimeout(() => spectator.component.expandNodeIds.next(['1', '2', '3']));
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

  xit('should delete a node which has multiple versions (draft, published, ...)', fakeAsync(() => {

  }));

  it('should copy a root node to root', fakeAsync(() => {

    db.initialData.and.returnValue(of(recentDocuments));
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);

    db.treeUpdates.next(newNode({title: 'Test Document 4'}));

    tick(5000);
    spectator.detectChanges();
    hasNumberOfTreeNodes(4);

    // new folder should be last
    nodeContainsTitle(3, 'Test Document 4');

  }));

  xit('should copy a root node to a folder', fakeAsync(() => {

  }));

  xit('should copy a child node to root', fakeAsync(() => {

  }));

  xit('should copy a whole tree/folder to root', fakeAsync(() => {

  }));

  it('should move a root node to root?', fakeAsync(() => {

    db.getPath.and.returnValue(Promise.resolve(['1']));
    db.initialData.and.returnValue(of(recentDocuments));
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);

    db.treeUpdates.next(newNode({updateType: UpdateType.Move, id: '1', parent: null}));

    tick(5000);
    spectator.detectChanges();
    hasNumberOfTreeNodes(3);

    // new folder should be last
    nodeContainsTitle(0, 'Test Document 1');

  }));

  it('should move a root node to a folder', fakeAsync(() => {

    const store = spectator.inject(TreeStore);
    const treeQuery = spectator.inject(TreeQuery);
    store.set(recentDocuments);

    db.getPath.and.returnValue(Promise.resolve(['1']));
    db.initialData.and.returnValue(of(recentDocuments));
    db.getChildren.and.callFake((parentId) => of(treeQuery.getChildren(parentId)));
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);

    // store must be updated where getChildren info comes from
    store.update('1', {_parent: '2'});
    db.treeUpdates.next(newNode({updateType: UpdateType.Move, id: '1', parent: '2'}));

    tick(1000);
    spectator.detectChanges();
    hasNumberOfTreeNodes(3);

    // new folder should be last
    nodeContainsTitle(0, 'Test Document 2');
    nodeContainsTitle(1, 'Test Document 1');
    nodeContainsTitle(2, 'Test Document 3');

    nodeIsExpanded(0);
    nodeHasLevel(1, 1);
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
    spectator.detectChanges();

    tick(10000);
    nodeIsSelected(2);
  }));

  xit('should find a node by search', fakeAsync(() => {

  }));

  xit('should show no result info if search did not found anything', fakeAsync(() => {

  }));

  xit('should deselect all nodes when a new one is added (#1722)', fakeAsync(() => {

  }));

  xit('should add a folder under another folder two levels deeper', fakeAsync(() => {
    // all folders must not be expanded initially
  }));

  fdescribe('Multi-Selection', () => {
    beforeEach(() => {
      spectator.setInput('showMultiSelectButton', true);
      spectator.detectChanges();
      spectator.click('[data-cy="edit-button"]');
    });

    it('should enable and disable multi selection mode', () => {
      // all three documents have a checkbox
      expect(spectator.queryAll('mat-tree mat-checkbox').length).toBe(3);

      // no document should be selected initially
      checkSelectionCount(0);

      // no checkboxes after leaving edit mode
      spectator.click('[data-cy="exit-multi-select-mode"]');
      expect(spectator.queryAll('mat-tree mat-checkbox').length).toBe(0);
    });

    fit('should have the currently opened node initially selected', () => {
      spectator.click('[data-cy="exit-multi-select-mode"]');

      selectNode(0);
      spectator.click('[data-cy="edit-button"]');

      checkNodeIsCheckboxSelected(0);
      checkSelectionCount(1);

      // check that node is still selected and active after leaving multi select mode
      spectator.click('[data-cy="exit-multi-select-mode"]');
      nodeIsSelected(0);
    });

    it('should check/uncheck all nodes at once', () => {
      const toggleAllSelectionSpy = spyOn(spectator.component, 'toggleAllSelection');
      expect(toggleAllSelectionSpy).toHaveBeenCalledTimes(0);

      // ATTENTION: checkbox needs first click event before change events are triggered correctly
      spectator.click('[data-cy="toggle-all-selection"] label');
      spectator.detectChanges();
      expect(toggleAllSelectionSpy).toHaveBeenCalledWith(true);

      // WORKAROUND: onchange event is not correctly triggered with checkbox, so we set the action ourselves
      spectator.component.selectionModel.select(...spectator.component.treeControl.dataNodes);
      spectator.triggerEventHandler('[data-cy="toggle-all-selection"]', 'change', {});
      checkSelectionCount(3);

      // WORKAROUND: onchange event is not correctly triggered with checkbox, so we set the action ourselves
      spectator.component.selectionModel.clear();
      spectator.triggerEventHandler('[data-cy="toggle-all-selection"]', 'change', {});
      checkSelectionCount(0);
    });
  });

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

  function nodeHasLevel(index: number, level: number) {
    const nodes = spectator.queryAll('.mat-tree-node');
    expect(nodes[index]).toHaveStyle({
      'padding-left': `${24 * level}px`
    });
  }

  function sendTreeEvent(type: UpdateType, docs: DocumentAbstract[], parent?: string) {
    db.treeUpdates.next({type: type, data: docs, parent: parent});

    // Fixme: why this timer? Analyze!
    tick(1000);
  }

  const nodeAtIndex = (index) => spectator.queryAll('.mat-tree-node .mat-icon')[index];


  const nodeExpectation = (index) => expect(spectator.queryAll('.mat-tree-node .mat-icon')[index]);

  function nodeHasClass(index: number, stateClass: string) {
    nodeExpectation(index).toHaveClass(stateClass);
  }

  function nodeHasNotClass(index: number, stateClass: string) {
    nodeExpectation(index).not.toHaveClass(stateClass);
  }

  function nodeIsExpanded(index: number) {
    expect(spectator.queryAll('.mat-tree-node .mat-icon')[index]).toHaveClass('expanded');
  }

  function nodeIsSelected(index: number) {
    nodeExpectation(index).toHaveClass('active');
  }

  function newNode(options: { id?, type?, state?, title?, parent?, updateType?: UpdateType }): UpdateDatasetInfo {
    return {
      type: options.updateType || UpdateType.New,
      // @ts-ignore
      data: [{
        id: options.id || '123',
        _type: options.type || 'FOLDER',
        _parent: options.parent || null,
        _state: options.state || 'W',
        title: options.title || 'Test Document 123'
      }],
      parent: options.parent || null,
      doNotSelect: true
    };
  }

  function checkSelectionCount(count: number) {
    expect(spectator.queryAll('mat-tree mat-checkbox.mat-checkbox-checked').length).toBe(count);
  }
  function checkNodeIsCheckboxSelected(index: number) {
    expect(spectator.queryAll('mat-tree mat-checkbox')[index]).toHaveClass('mat-checkbox-checked');
  }

});
