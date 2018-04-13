import { ModalService } from '../../../services/modal/modal.service';
import { ErrorService } from '../../../services/error.service';
import { MetadataTreeComponent } from './tree.component';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormularService } from '../../../services/formular/formular.service';
import { StorageService } from '../../../services/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateDatasetInfo } from '../../../models/update-dataset-info.model';
import { UpdateType } from '../../../models/update-type.enum';
import { FormToolbarService } from '../../toolbar/form-toolbar.service';
import { Observable, Subject } from 'rxjs/index';

let fixture: any, comp: any, el: any;

class RouterMock {
  navigate() {
  }
}
const ActivatedRouteMock = {
  params: {
    subscribe: () => Observable.create( {id: '-1'} )
  }
};
const formToolbarServiceStub = {
  toolbarEvent$: {
    subscribe: () => Observable.create( 'invalid_event_id' )
  }
};


const childrenThree = [{_id: '1', _profile: 'A'}, {_id: '2', _profile: 'A'}, {_id: '3', _profile: 'A'}];
const childrenNoProfile = [{_id: '1'}, {_id: '2'}, {_id: '3'}];
let childrenTree = childrenThree;

describe( 'TreeComponent', () => {
  let storageService: StorageService = null;
  beforeEach( () => {
    const subject = new Subject<UpdateDatasetInfo>();
    const storageServiceStub = {
      datasetsChanged: subject,
      datasetsChanged$: subject.asObservable(),
      getChildDocuments: (id: string) => {
        if (!id) {
          return Observable.create( childrenTree );
        } else if (id === '3') {
          return Observable.create( [{_id: '4', _profile: 'A'}] );
        } else {
          return Observable.create( [{_id: 'x', _profile: 'A'}] );
        }
      }
    };

    const formularServiceStub = {
      getTitle: (profile: string, doc: any) => {
        return doc.title ? doc.title : 'no-title';
      },
      getIconClass: (profile: string) => {
        return 'X';
      }
    };

    // refine the test module by declaring the test component
    TestBed.configureTestingModule( {
      declarations: [MetadataTreeComponent],
      providers: [
        {provide: Router, useClass: RouterMock},
        {provide: ActivatedRoute, useValue: ActivatedRouteMock},
        {provide: StorageService, useValue: storageServiceStub},
        {provide: FormularService, useValue: formularServiceStub},
        {provide: FormToolbarService, useValue: formToolbarServiceStub},
        ErrorService, ModalService],
      imports: []
    } );

    // create component and test fixture
    fixture = TestBed.createComponent( MetadataTreeComponent );

    // get test component from the fixture
    comp = fixture.componentInstance;
  } );

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

  it( 'should add a new root node', fakeAsync( () => {
    fixture.detectChanges();

    // the viewport of the tree is set with a setTimeout function, so we have to wait a bit
    tick( 10 );

    // add a new document via the storage service
    storageService = TestBed.get( StorageService );
    storageService.datasetsChanged.next( {type: UpdateType.New, data: [{_id: '-1', _profile: 'A'}]} );

    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    const doc = fixture.debugElement;
    el = doc.queryAll( By.css( 'tree-node' ) );

    expect( el.length ).toBe( 4 );
    expect( comp.nodes.length ).toBe( 4 );
    expect( comp.nodes[3].id ).toBe( '-1' );
  } ) );

  it( 'should modifiy a root node', fakeAsync( () => {
    fixture.detectChanges();

    // the viewport of the tree is set with a setTimeout function, so we have to wait a bit
    tick( 10 );

    // add a new document via the storage service
    storageService = TestBed.get( StorageService );
    storageService.datasetsChanged.next( {type: UpdateType.New, data: [{_id: '-1', _profile: 'A'}]} );

    tick( 10 );

    // update document with a new id
    storageService.datasetsChanged.next( {
      type: UpdateType.Update,
      data: [{_id: '12345', _profile: 'A', _previousId: '-1'}]
    } );

    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    const doc = fixture.debugElement;
    el = doc.queryAll( By.css( 'tree-node' ) );

    expect( el.length ).toBe( 4 );
    expect( comp.nodes.length ).toBe( 4 );
    expect( comp.nodes[3].id ).toBe( '12345' );
  } ) );

  it( 'should delete a root node', () => {
    fixture.detectChanges();

    // remove document via the storage service
    storageService = TestBed.get( StorageService );
    storageService.datasetsChanged.next( {type: UpdateType.Delete, data: [{_id: '2'}]} );

    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    const doc = fixture.debugElement;
    el = doc.queryAll( By.css( 'tree-node' ) );

    expect( el.length ).toBe( 2 );
    // node with id '2' should be gone now
    expect( comp.nodes[0].id ).toBe( '1' );
    expect( comp.nodes[1].id ).toBe( '3' );
  } );

  it( 'should add a new child node', fakeAsync( () => {
    fixture.detectChanges();

    tick( 10 );

    // add a new document via the storage service
    storageService = TestBed.get( StorageService );
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
    storageService = TestBed.get( StorageService );
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
    storageService = TestBed.get( StorageService );
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

} );
