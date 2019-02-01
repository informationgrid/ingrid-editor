import {createHostComponentFactory, Spectator} from "@netbasal/spectator";
import {DocumentDataService} from "../../../services/document/document-data.service";
import {MetadataTreeComponent} from "./tree.component";
import {DocumentAbstract} from "../../../store/document/document.model";
import {MatButtonModule, MatDialogModule, MatIconModule, MatTreeModule} from "@angular/material";
import {createHost} from "@angular/compiler/src/core";

const childrenThree = [{_id: '1', _profile: 'A'}, {_id: '2', _profile: 'A'}, {_id: '3', _profile: 'A'}];
const childrenNoProfile = [{_id: '1'}, {_id: '2'}, {_id: '3'}];
let childrenTree = childrenThree;

describe('TreeComponent', () => {

  let spectator: Spectator<MetadataTreeComponent>;
  let host;
  const createComponent = createHostComponentFactory({
    component: MetadataTreeComponent,
    imports: [MatTreeModule, MatIconModule, MatDialogModule, MatButtonModule],
    mocks: [DocumentDataService],
    detectChanges: false
  });

  beforeEach(() => {
    host = createHost(`<ige-tree></ige-tree>`)
  });

  it('should create', () => {
    expect(host.component).toBeDefined();
  });

  it('should show root nodes on startup', () => {
    /*let dataService = spectator.get<DocumentDataService>(DocumentDataService);
    dataService.find.and.returnValue(of(recentDocuments));
    let formService = spectator.get<FormularService>(FormularService);
    formService.getTitle.and.callFake((profile, item) => {
      return item.title;
    });*/


    spectator.component.dataSource.data = <DocumentAbstract[]>[
      {
        id: '',
        title: 'Node 1',
        icon: '',
        _state: '',
        _profile: '',
        _hasChildren: false,
        _id: ''
      },
      {
        id: '',
        title: 'Node 2',
        icon: '',
        _state: '',
        _profile: '',
        _hasChildren: false,
        _id: ''
      },
      {
        id: '',
        title: 'Node 3',
        icon: '',
        _state: '',
        _profile: '',
        _hasChildren: false,
        _id: ''
      }
    ];

    spectator.detectChanges();

    let recentDocs = spectator.queryAll('.recentDocs li');
    expect(recentDocs[0].textContent.trim()).toEqual('Test Document 1');
    expect(recentDocs[1].textContent.trim()).toEqual('Test Document 2');
    expect(recentDocs[2].textContent.trim()).toEqual('Test Document 3');
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

    it( 'should add a new root node', fakeAsync( () => {
      fixture.detectChanges();

      // the viewport of the tree is set with a setTimeout function, so we have to wait a bit
      tick( 10 );

      // add a new document via the storage service
      storageService = TestBed.get( DocumentService );
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
      storageService = TestBed.get( DocumentService );
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
      storageService = TestBed.get( DocumentService );
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

});
