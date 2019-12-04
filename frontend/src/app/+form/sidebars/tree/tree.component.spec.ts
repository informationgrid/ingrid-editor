import {DynamicDatabase, TreeComponent} from './tree.component';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTreeModule} from '@angular/material/tree';
import {createComponentFactory, Spectator, SpyObject} from '@ngneat/spectator';
import {recentDocuments} from '../../../_test-data/documents';
import {of, Subject} from 'rxjs';
import {TreeHeaderComponent} from './tree-header/tree-header.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormFieldsModule} from '../../../form-fields/form-fields.module';
import {fakeAsync, tick} from '@angular/core/testing';
import {UpdateType} from '../../../models/update-type.enum';

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
  });

  it('should create component', () => {
    // spectator = createHost(`<ige-tree></ige-tree>`);
    expect(spectator.component).toBeDefined();
  });

  it('should show root nodes on startup', () => {
    spectator.detectChanges();

    const recentDocs = spectator.queryAll('.mat-tree-node');
    expect(recentDocs.length).toEqual(3);
    expect(recentDocs[0].textContent.trim()).toContain('Test Document 1');
    expect(recentDocs[1].textContent.trim()).toContain('Test Document 2');
    expect(recentDocs[2].textContent.trim()).toContain('Test Document 3');
  });

  /*

      it( 'should show no tree if documents have no profile info set', () => {
        childrenTree = <any>childrenNoProfile;
        fixture.detectChanges();

        // find the title element in the DOM using a CSS selector
        const doc = fixture.debugElement;
        el = doc.queryAll( By.css( 'tree-node' ) );

        // confirm the element's content
        expect( el.length ).toBe( 0 );
      } );

      it( 'should show create a tree structure', () => {
        childrenTree = childrenThree;
        fixture.detectChanges();

        // find the title element in the DOM using a CSS selector
        const doc = fixture.debugElement;
        el = doc.queryAll( By.css( 'tree-node' ) );

        // confirm the element's content
        expect( el.length ).toBe( 3 );

      } );
  */
  it('should add a new root node', fakeAsync(() => {
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);

    // @ts-ignore
    db.treeUpdates.next({type: UpdateType.New, data: [{id: '-1', _profile: 'A'}]});

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

  /*
        it( 'should add a new child node', fakeAsync( () => {
          fixture.detectChanges();

          tick( 10 );

          // add a new document via the storage service
          storageService = TestBed.get( DocumentService );
          storageService.datasetsChanged.next( {type: UpdateType.New, data: [{_id: '-1', _profile: 'A', _parent: '3'}]} );

          // find the title element in the DOM using a CSS selector
          const doc = fixture.debugElement;
          el = doc.queryAll( By.css( 'tree-node' ) );

          // root nodes should still be three
          expect( el.length ).toBe( 3 );

          tick( 100 );

          // after some time the node should be added to the parent
          fixture.detectChanges();

          const el2 = doc.query( By.css( 'tree-node:nth-child(3) .toggle-children-wrapper' ) );
          el2.nativeElement.click();

          tick( 100 );

          el = doc.queryAll( By.css( '.tree-children tree-node' ) );

          // node with id should have a child now
          expect( el.length ).toBe( 1 );

          // the model also
          expect( comp.nodes[2].children.length ).toBe( 1 );
          expect( comp.nodes[2].children[0].id ).toBe( '-1' );
        } ) );

        it( 'should modify a child node', fakeAsync( () => {
          fixture.detectChanges();

          tick( 10 );

          // add a new document and update it via the storage service
          storageService = TestBed.get( DocumentService );
          storageService.datasetsChanged.next( {type: UpdateType.New, data: [{_id: '-1', _profile: 'A', _parent: '3'}]} );

          // find the title element in the DOM using a CSS selector
          const doc = fixture.debugElement;

          tick( 100 );

          fixture.detectChanges();

          const el2 = doc.query( By.css( 'tree-node:nth-child(3) .toggle-children-wrapper' ) );
          el2.nativeElement.click();

          // after changes to tree are visible, modify dataset
          storageService.datasetsChanged.next( {
            type: UpdateType.Update,
            data: [{_id: '12345', _previousId: '-1', title: 'modified'}]
          } );

          el = doc.queryAll( By.css( '.tree-children tree-node' ) );

          // node with id should have a child now
          expect( el.length ).toBe( 1 );

          // the model also
          expect( comp.nodes[2].children.length ).toBe( 1 );
          expect( comp.nodes[2].children[0].id ).toBe( '12345' );
        } ) );

        it( 'should delete a child node', fakeAsync( () => {
          fixture.detectChanges();

          tick( 10 );

          // add a new document via the storage service
          storageService = TestBed.get( DocumentService );
          storageService.datasetsChanged.next( {type: UpdateType.New, data: [{_id: '-1', _profile: 'A', _parent: '3'}]} );

          // find the title element in the DOM using a CSS selector
          const doc = fixture.debugElement;

          tick( 100 );

          // after some time the node should be added to the parent
          fixture.detectChanges();

          const el2 = doc.query( By.css( 'tree-node:nth-child(3) .toggle-children-wrapper' ) );
          el2.nativeElement.click();

          tick( 100 );

          el = doc.queryAll( By.css( '.tree-children tree-node' ) );

          // node with id should have a child now
          expect( el.length ).toBe( 1 );

          storageService.datasetsChanged.next( {type: UpdateType.Delete, data: [{_id: '-1'}]} );
          fixture.detectChanges();
          el = doc.queryAll( By.css( '.tree-children tree-node' ) );

          // node with id should have a child now
          expect( el.length ).toBe( 0 );

          // the model also should have a child
          expect( comp.nodes.length ).toBe( 3 );
          expect( comp.nodes[2].children.length ).toBe( 0 );
        } ) );

        xit( 'should expand a node and load remote children', () => {
        } );
      */


  function hasNumberOfTreeNodes(num) {
    const nodes = spectator.queryAll('.mat-tree-node');
    expect(nodes.length).toBe(num);
  }

  function nodeContainsTitle(nodeIndex: number, title: string) {
    const nodes = spectator.queryAll('.mat-tree-node');
    expect(nodes[nodeIndex].textContent.trim()).toContain(title);
  }

});
