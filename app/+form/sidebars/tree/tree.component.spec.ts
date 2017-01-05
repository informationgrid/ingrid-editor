import { TreeModule } from './../../../_forks/angular2-tree-component/angular2-tree-component';
import { ModalService } from './../../../services/modal/modal.service';
import { ErrorService } from './../../../services/error.service';
import {MetadataTreeComponent} from "./tree.component";
import {TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";
import {FormularService} from "../../../services/formular/formular.service";
import {ConfigService} from "../../../config/config.service";
import {StorageService} from "../../../services/storage/storage.service";
import {Router, ActivatedRoute} from "@angular/router";
import {UpdateDatasetInfo} from "../../../models/update-dataset-info.model";
import {Subject, Observable} from "rxjs";
import {UpdateType} from "../../../models/update-type.enum";
let fixture: any, comp: any, el: any;

class RouterMock {
  navigate() {}
}
let ActivatedRouteMock = {
  params: {
    subscribe: () => {}
  }
};

let childrenThree = [{_id: '1', _profile: 'A'}, {_id: '2', _profile: 'A'}, {_id: '3', _profile: 'A'}];
let childrenNoProfile = [{_id: '1'}, {_id: '2'}, {_id: '3'}];
let childrenTree = childrenThree;

describe('TreeComponent', () => {
  let storageService: StorageService = null;
  beforeEach(() => {
    let subject = new Subject<UpdateDatasetInfo>();
    let storageServiceStub = {
      datasetsChanged: subject,
      datasetsChanged$: subject.asObservable(),
      getChildDocuments: (id: string) => {
        if (!id) {
          return Observable.of(childrenTree); //.map(MOCKACCOUNT =>JSON.stringify(MOCKACCOUNT));
        } else if (id === '3') {
          return Observable.of([{_id: '4', _profile: 'A'}]);
        } else {
          return Observable.of([{_id: 'x', _profile: 'A'}]);
        }
      }
    };

    let formularServiceStub = {
      getTitle: (profile: string, doc: any) => {
        return doc.title ? doc.title : 'no-title';
      },
      getIconClass: (profile: string) => {
        return 'X';
      }
    };

    // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      declarations: [MetadataTreeComponent],
      providers: [
        { provide: Router, useClass: RouterMock},
        { provide: ActivatedRoute, useValue: ActivatedRouteMock},
        { provide: StorageService, useValue: storageServiceStub},
        { provide: FormularService, useValue: formularServiceStub},
        ConfigService, ErrorService, ModalService],
      imports: [TreeModule]
    });

    // create component and test fixture
    console.log( 'create component' );
    fixture = TestBed.createComponent(MetadataTreeComponent);

    console.log( 'get instance' );
    // get test component from the fixture
    comp = fixture.componentInstance;
  });

  it('should show no tree if documents have no profile info set', () => {
    childrenTree = <any>childrenNoProfile;
    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    let doc = fixture.debugElement;
    el = doc.queryAll(By.css('treenode'));

    // confirm the element's content
    expect(el.length).toBe(0);
  });

  it('should show create a tree structure', () => {
    childrenTree = childrenThree;
    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    let doc = fixture.debugElement;
    el = doc.queryAll(By.css('treenode'));

    // confirm the element's content
    expect(el.length).toBe(3);

  });

  it('should add a new root node', () => {
    fixture.detectChanges();

    // add a new document via the storage service
    storageService = TestBed.get(StorageService);
    storageService.datasetsChanged.next({ type: UpdateType.New, data: {_id: '-1', _profile: 'A'}});

    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    let doc = fixture.debugElement;
    el = doc.queryAll(By.css('treenode'));

    expect(el.length).toBe(4);
    expect(comp.nodes.length).toBe(4);
    expect(comp.nodes[3].id).toBe('-1');
  });

  it('should modifiy a root node', () => {
    fixture.detectChanges();

    // add a new document via the storage service
    storageService = TestBed.get(StorageService);
    storageService.datasetsChanged.next({ type: UpdateType.New, data: {_id: '-1', _profile: 'A'}});

    // update document with a new id
    storageService.datasetsChanged.next({ type: UpdateType.Update, data: {_id: '12345', _profile: 'A', _previousId: '-1'}});

    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    let doc = fixture.debugElement;
    el = doc.queryAll(By.css('treenode'));

    expect(el.length).toBe(4);
    expect(comp.nodes.length).toBe(4);
    expect(comp.nodes[3].id).toBe('12345');
  });

  it('should delete a root node', () => {
    fixture.detectChanges();

    // remove document via the storage service
    storageService = TestBed.get(StorageService);
    storageService.datasetsChanged.next({ type: UpdateType.Delete, data: {_id: '2'}});

    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    let doc = fixture.debugElement;
    el = doc.queryAll(By.css('treenode'));

    expect(el.length).toBe(2);
    // node with id '2' should be gone now
    expect(comp.nodes[0].id).toBe('1');
    expect(comp.nodes[1].id).toBe('3');
  });

  it('should add a new child node', (done) => {
    fixture.detectChanges();

    // add a new document via the storage service
    storageService = TestBed.get(StorageService);
    storageService.datasetsChanged.next({ type: UpdateType.New, data: {_id: '-1', _profile: 'A', _parent: '3'}});

    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    let doc = fixture.debugElement;
    el = doc.queryAll(By.css('treenode'));

    // root nodes should still be three
    expect(el.length).toBe(3);

    setTimeout(() => {
      // after some time the node should be added to the parent
      fixture.detectChanges();
      el = doc.queryAll(By.css('.tree-children treenode'));

      // node with id should have a child now
      expect(el.length).toBe(1);

      // the model also
      expect(comp.nodes[2].children.length).toBe(1);
      expect(comp.nodes[2].children[0].id).toBe('-1');
      done();
    }, 100);
  });

  it('should modify a child node', (done) => {
    fixture.detectChanges();

    // add a new document and update it via the storage service
    storageService = TestBed.get(StorageService);
    storageService.datasetsChanged.next({ type: UpdateType.New, data: {_id: '-1', _profile: 'A', _parent: '3'}});

    // find the title element in the DOM using a CSS selector
    let doc = fixture.debugElement;

    setTimeout(() => {
      // after some time the node should be added to the parent
      fixture.detectChanges();

      // after changes to tree are visible, modify dataset
      storageService.datasetsChanged.next({ type: UpdateType.Update, data: {_id: '12345', _previousId: '-1'}});
      fixture.detectChanges();

      el = doc.queryAll(By.css('.tree-children treenode'));

      // node with id should have a child now
      expect(el.length).toBe(1);

      // the model also
      expect(comp.nodes[2].children.length).toBe(1);
      expect(comp.nodes[2].children[0].id).toBe('12345');
      done();
    }, 100);
  });

  it('should delete a child node', (done) => {
    fixture.detectChanges();

    // add a new document via the storage service
    storageService = TestBed.get(StorageService);
    storageService.datasetsChanged.next({ type: UpdateType.New, data: {_id: '-1', _profile: 'A', _parent: '3'}});

    // find the title element in the DOM using a CSS selector
    let doc = fixture.debugElement;

    setTimeout(() => {
      // after some time the node should be added to the parent
      fixture.detectChanges();
      storageService.datasetsChanged.next({ type: UpdateType.Delete, data: {_id: '-1'}});
      fixture.detectChanges();
      el = doc.queryAll(By.css('.tree-children treenode'));

      // node with id should have a child now
      expect(el.length).toBe(0);

      // the model also should have a child
      expect(comp.nodes.length).toBe(3);
      expect(comp.nodes[2].children.length).toBe(0);
      done();
    }, 100);
  });

  xit('should expand a node and load remote children', () => {});

});