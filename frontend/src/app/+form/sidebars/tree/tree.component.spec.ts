import {DynamicDatabase, TreeComponent} from './tree.component';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTreeModule} from '@angular/material/tree';
import {createComponentFactory, Spectator, SpyObject} from '@ngneat/spectator';
import {childDocuments1, recentDocuments} from '../../../_test-data/documents';
import {of, Subject} from 'rxjs';
import {TreeHeaderComponent} from './tree-header/tree-header.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormFieldsModule} from '../../../form-fields/form-fields.module';
import {fakeAsync, tick} from '@angular/core/testing';
import {UpdateType} from '../../../models/update-type.enum';
import {createDocument, DocumentAbstract} from '../../../store/document/document.model';
import {delay} from 'rxjs/operators';

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

    const doc = createDocument({id: '12345', _profile: 'A', title: 'new node'});
    sendTreeEvent(UpdateType.New, [doc]);

    hasNumberOfTreeNodes(4);
    expect(spectator.component.dataSource.data.length).toBe(4);
  }));

  it('should modifiy a root node', fakeAsync(() => {
    spectator.detectChanges();

    // add a new document via the storage service
    // @ts-ignore
    db.treeUpdates.next({type: UpdateType.New, data: [{id: '12345', _profile: 'A', title: 'initial node'}]});
    hasNumberOfTreeNodes(4);
    nodeContainsTitle(0, 'initial node');

    // update document with a new id
    // @ts-ignore
    db.treeUpdates.next({type: UpdateType.Update, data: [{id: '12345', _profile: 'A', title: 'modified node'}]});

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

  fit('should add a new child node', fakeAsync(() => {
    spectator.detectChanges();

    // add a new document via the storage service
    const doc = createDocument({id: '12345', _profile: 'A', title: 'child'});
    sendTreeEvent(UpdateType.New, [doc], '3');
    // children.push(doc);

    // tree node should be expanded and show new node
    hasNumberOfTreeNodes(4);

    // when collapsing node then child should disappear
    toggleTreeNode(2);

    hasNumberOfTreeNodes(3);

  }));

  it('should modify a child node', fakeAsync(() => {
    spectator.detectChanges();

    // add a new document and update it via the storage service
    const doc = createDocument({id: '12345', _profile: 'A', title: 'child node'});
    sendTreeEvent(UpdateType.New, [doc], '3');

    // after changes to tree are visible, modify dataset
    const child = createDocument({id: '12345', _profile: 'A', title: 'modified child node'});
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
    const doc = createDocument({id: '12345', _profile: 'A', title: 'child node'});
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

    toggleTreeNode(0);

    hasNumberOfTreeNodes(3);

    tick(3000);

    hasNumberOfTreeNodes(5);
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

  function toggleTreeNode(index: number) {
    const nodes = spectator.queryAll('.mat-tree-node');
    spectator.click(nodes[index]);
  }

  function sendTreeEvent(type: UpdateType, docs: DocumentAbstract[], parent?: string) {
    db.treeUpdates.next({type: type, data: docs, parent: parent});
  }
});
