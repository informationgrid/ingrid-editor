/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { TreeComponent } from "./tree.component";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
import {
  createComponentFactory,
  Spectator,
  SpyObject,
} from "@ngneat/spectator";
import {
  childDocuments1,
  deeplyNestedDocumentsLevel1,
  deeplyNestedDocumentsLevel2,
  deeplyNestedDocumentsLevel3,
  deeplyNestedDocumentsRoot,
  recentDocuments,
  rootDocumentsWithDifferentStates,
} from "../../../_test-data/documents";
import { of, Subject } from "rxjs";
import { TreeHeaderComponent } from "./tree-header/tree-header.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormFieldsModule } from "../../../form-fields/form-fields.module";
import { fakeAsync, tick } from "@angular/core/testing";
import { UpdateType } from "../../../models/update-type.enum";
import {
  createDocument,
  DocumentAbstract,
} from "../../../store/document/document.model";
import { delay } from "rxjs/operators";
import { DynamicDatabase } from "./dynamic.database";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { UntilDestroy } from "@ngneat/until-destroy";
import { EmptyNavigationComponent } from "./empty-navigation/empty-navigation.component";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { ReactiveFormsModule } from "@angular/forms";
import { FakeMatIconRegistry } from "@angular/material/icon/testing";
import { UpdateDatasetInfo } from "../../../models/update-dataset-info.model";
import { TreeStore } from "../../../store/tree/tree.store";
import { TreeQuery } from "../../../store/tree/tree.query";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ConfigService } from "../../../services/config/config.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { TranslocoModule } from "@ngneat/transloco";
import { SearchInputComponent } from "../../../shared/search-input/search-input.component";
import { SharedDocumentItemModule } from "../../../shared/shared-document-item.module";
import { DocumentIconComponent } from "../../../shared/document-icon/document-icon.component";
import { getTranslocoModule } from "../../../transloco-testing.module";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

function mapDocumentsToTreeNodes(docs: DocumentAbstract[], level: number) {
  return docs.map(
    (doc) =>
      new TreeNode(
        <number>doc.id,
        doc._uuid,
        doc.title,
        doc._type,
        doc._state,
        level,
        doc._hasChildren,
        doc._parent,
        doc.icon,
      ),
  );
}

describe("TreeComponent", () => {
  let spectator: Spectator<TreeComponent>;
  let db: SpyObject<DynamicDatabase>;
  let config: SpyObject<ConfigService>;
  const createHost = createComponentFactory({
    component: TreeComponent,
    imports: [
      MatTreeModule,
      MatIconModule,
      MatDialogModule,
      MatButtonModule,
      MatCheckboxModule,
      MatSlideToggleModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatAutocompleteModule,
      FormFieldsModule,
      MatProgressSpinnerModule,
      MatSelectModule,
      MatSnackBarModule,
      TranslocoModule,
      SharedDocumentItemModule,
      SearchInputComponent,
      getTranslocoModule(),
    ],
    declarations: [
      TreeHeaderComponent,
      EmptyNavigationComponent,
      DocumentIconComponent,
    ],
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      { provide: MatIconRegistry, useClass: FakeMatIconRegistry },
    ],
    componentMocks: [DynamicDatabase, ConfigService],
    detectChanges: false,
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
    config = spectator.inject(ConfigService, true);
    config.hasCatAdminRights.and.returnValue(true);
  });

  it("should create component", () => {
    expect(spectator.component).toBeDefined();
  });

  it("should show root nodes on startup", () => {
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);
    nodeContainsTitle(0, "Test Document 1");
    nodeContainsTitle(1, "Test Document 2");
    nodeContainsTitle(2, "Test Document 3");
  });

  it("should show no tree if documents have no profile info set", () => {
    db.initialData.and.returnValue(of([]));
    spectator.detectChanges();

    // find the title element in the DOM using a CSS selector
    hasNumberOfTreeNodes(0);
  });

  it("should add a new root node", fakeAsync(() => {
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);

    const doc = createDocument({
      id: 12345,
      _type: "A",
      title: "new node",
      _state: "W",
    });
    sendTreeEvent(UpdateType.New, [doc]);

    hasNumberOfTreeNodes(4);
    expect(spectator.component.dataSource.data.length).toBe(4);
  }));

  it("should modify a root node", fakeAsync(() => {
    spectator.detectChanges();

    // add a new document via the storage service
    const doc = createDocument({
      id: 12345,
      _type: "A",
      title: "initial node",
      _state: "W",
    });
    sendTreeEvent(UpdateType.New, [doc]);
    hasNumberOfTreeNodes(4);
    nodeContainsTitle(3, "initial node");

    // update document with a new id
    const docUpdate = createDocument({
      id: 12345,
      _type: "A",
      title: "modified node",
      _state: "W",
    });
    sendTreeEvent(UpdateType.Update, [docUpdate]);

    // new/modified node should be placed correctly (alphabetically)
    nodeContainsTitle(3, "modified node");
  }));

  it("should delete a root node", fakeAsync(() => {
    spectator.detectChanges();

    // remove document via the storage service
    // @ts-ignore
    db.treeUpdates.next({ type: UpdateType.Delete, data: [{ id: 2 }] });

    // node with id '2' should be gone now
    hasNumberOfTreeNodes(2);
    const treeNode = spectator.component.dataSource.data;
    expect(treeNode[0]._id).toBe(1);
    expect(treeNode[1]._id).toBe(3);

    tick(1000);
  }));

  it("should add a new child node", fakeAsync(() => {
    const newChildDocOf3: any = {
      id: 12345,
      _profile: "A",
      title: "child",
      _state: "W",
      _parent: 3,
    };
    db.getChildren.and.callFake((id) => {
      switch (id) {
        case 3:
          return of([newChildDocOf3]);
        default:
          throw new Error("Unknown parent: " + id);
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

    tick(1000);
  }));

  it("should modify a child node", fakeAsync(() => {
    const newDoc: any = {
      id: 12345,
      _profile: "A",
      title: "child node",
      _state: "W",
    };
    db.getChildren.and.callFake((id) => {
      switch (id) {
        case 3:
          return of([newDoc]);
        default:
          throw new Error("Unknown parent: " + id);
      }
    });
    spectator.detectChanges();

    // add a new document and update it via the storage service
    const doc = createDocument(newDoc);
    sendTreeEvent(UpdateType.New, [doc], 3);

    // after changes to tree are visible, modify dataset
    const child = createDocument({
      id: 12345,
      _type: "A",
      title: "modified child node",
      _state: "W",
    });
    sendTreeEvent(UpdateType.Update, [child]);

    hasNumberOfTreeNodes(4);

    // check if correct node has been modified
    nodeContainsTitle(0, "Test Document 1");
    nodeContainsTitle(1, "Test Document 2");
    nodeContainsTitle(2, "Test Document 3");
    nodeContainsTitle(3, "modified child node");
  }));

  it("should delete a child node", fakeAsync(() => {
    const newDoc: any = {
      id: 12345,
      _profile: "A",
      title: "child node",
      _state: "W",
    };
    db.getChildren.and.callFake(() => of([newDoc]));
    spectator.detectChanges();

    // add a new document and update it via the storage service
    const doc = createDocument(newDoc);
    sendTreeEvent(UpdateType.New, [doc], 3);

    hasNumberOfTreeNodes(4);

    // @ts-ignore
    sendTreeEvent(UpdateType.Delete, [{ id: 12345 }]);

    hasNumberOfTreeNodes(3);

    // TODO: check if correct node has been removed
  }));

  it("should expand a node and load remote children", fakeAsync(() => {
    const firstModRececentDoc = Object.assign({}, recentDocuments[0]);
    firstModRececentDoc._hasChildren = true;
    db.initialData.and.returnValue(of([firstModRececentDoc]));
    db.getChildren.and.returnValue(of(childDocuments1).pipe(delay(2000)));
    spectator.detectChanges();

    selectNode(0);

    spectator.detectChanges();

    hasNumberOfTreeNodes(1);

    tick(3000);

    hasNumberOfTreeNodes(3);
  }));

  it("should represent all states of a node (published, working, both)", fakeAsync(() => {
    db.initialData.and.returnValue(of(rootDocumentsWithDifferentStates));
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);
    nodeImageHasClass(0, "published");
    nodeImageHasNotClass(0, "working");
    nodeImageHasClass(1, "working");
    nodeImageHasNotClass(1, "published");
    nodeImageHasClass(2, "workingWithPublished");
    nodeImageHasNotClass(2, "working");
    nodeImageHasNotClass(2, "published");

    tick(1000);
  }));

  it("should initially expand to a deeply nested node", fakeAsync(() => {
    db.getPath.and.returnValue(Promise.resolve([1, 2, 3, 4]));
    db.initialData.and.returnValue(of(deeplyNestedDocumentsRoot));
    db.getChildren.and.callFake((id) => {
      switch (id) {
        case 1:
          return of(deeplyNestedDocumentsLevel1);
        case 2:
          return of(deeplyNestedDocumentsLevel2);
        case 3:
          return of(deeplyNestedDocumentsLevel3);
        default:
          throw new Error("Unknown parent: " + id);
      }
    });

    spectator.component.activeNodeId = 4;
    spectator.component.expandNodeIds = new Subject<number[]>();
    setTimeout(() => spectator.component.expandNodeIds.next([1, 2, 3]));
    spectator.detectChanges();

    tick();

    hasNumberOfTreeNodes(4);

    nodeIsExpanded(0);
    nodeIsExpanded(1);
    nodeIsExpanded(2);
    nodeContainsTitle(3, "Nested Document");
    tick(10000);
    nodeIsSelected(3);
  }));

  xit("should reload the tree (nodes expanded state remembered?)", fakeAsync(() => {}));

  xit("should delete a node which has multiple versions (draft, published, ...)", fakeAsync(() => {}));

  it("should copy a root node to root", fakeAsync(() => {
    db.initialData.and.returnValue(of(recentDocuments));
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);

    db.treeUpdates.next(newNode({ title: "Test Document 4" }));

    tick(5000);
    spectator.detectChanges();
    hasNumberOfTreeNodes(4);

    // new folder should be last
    nodeContainsTitle(3, "Test Document 4");
  }));

  xit("should copy a root node to a folder", fakeAsync(() => {}));

  xit("should copy a child node to root", fakeAsync(() => {}));

  xit("should copy a whole tree/folder to root", fakeAsync(() => {}));

  it("should move a root node to root?", fakeAsync(() => {
    db.getPath.and.returnValue(Promise.resolve(["1"]));
    db.initialData.and.returnValue(of(recentDocuments));
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);

    db.treeUpdates.next(
      newNode({ updateType: UpdateType.Move, id: 1, parent: null }),
    );

    tick(5000);
    spectator.detectChanges();
    hasNumberOfTreeNodes(3);

    // new folder should be last
    nodeContainsTitle(0, "Test Document 1");
  }));

  it("should move a root node to a folder", fakeAsync(() => {
    const store = spectator.inject(TreeStore);
    const treeQuery = spectator.inject(TreeQuery);
    store.set(recentDocuments);

    db.getPath.and.returnValue(Promise.resolve(["1"]));
    db.initialData.and.returnValue(of(recentDocuments));
    db.getChildren.and.callFake((parentId) =>
      of(treeQuery.getChildren(parentId)),
    );
    spectator.detectChanges();

    hasNumberOfTreeNodes(3);

    // store must be updated where getChildren info comes from
    store.update(1, { _parent: 2 });
    db.treeUpdates.next(
      newNode({ updateType: UpdateType.Move, id: 1, parent: 2 }),
    );

    tick(1000);
    spectator.detectChanges();
    hasNumberOfTreeNodes(3);

    // new folder should be last
    nodeContainsTitle(0, "Test Document 2");
    nodeContainsTitle(1, "Test Document 1");
    nodeContainsTitle(2, "Test Document 3");

    // nodeIsExpanded(0);
    nodeHasLevel(1, 1);
  }));

  xit("should move a child node to root", fakeAsync(() => {}));

  xit("should move a whole tree/folder to root", fakeAsync(() => {}));

  it("should select a node when clicking on it", fakeAsync(() => {
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

  xit("should find a node by search", fakeAsync(() => {}));

  xit("should show no result info if search did not found anything", fakeAsync(() => {}));

  xit("should deselect all nodes when a new one is added (#1722)", fakeAsync(() => {}));

  xit("should add a folder under another folder two levels deeper", fakeAsync(() => {
    // all folders must not be expanded initially
  }));

  describe("Multi-Selection", () => {
    beforeEach(() => {
      spectator.setInput("showMultiSelectButton", true);
    });

    it("should enable and disable multi selection mode", () => {
      spectator.detectChanges();
      spectator.click('[data-cy="edit-button"]');

      // all three documents have a checkbox
      expect(spectator.queryAll("mat-tree mat-checkbox").length).toBe(3);

      // no document should be selected initially
      checkSelectionCount(0);

      // no checkboxes after leaving edit mode
      spectator.click('[data-cy="exit-multi-select-mode"]');
      expect(spectator.queryAll("mat-tree mat-checkbox").length).toBe(0);
    });

    it("should have the currently opened node initially selected", () => {
      spectator.detectChanges();
      spectator.click('[data-cy="edit-button"]');

      spectator.click('[data-cy="exit-multi-select-mode"]');

      selectNode(0);
      spectator.click('[data-cy="edit-button"]');

      checkNodeIsCheckboxSelected(0);
      checkSelectionCount(1);

      // check that node is still selected and active after leaving multi select mode
      spectator.click('[data-cy="exit-multi-select-mode"]');
      nodeIsSelected(0);
    });

    it("should check/uncheck all nodes at once", () => {
      spectator.detectChanges();
      spectator.click('[data-cy="edit-button"]');

      const toggleAllSelectionSpy = spyOn(
        spectator.component.selection,
        "toggleAllSelection",
      );
      expect(toggleAllSelectionSpy).toHaveBeenCalledTimes(0);

      // ATTENTION: checkbox needs first click event before change events are triggered correctly
      spectator.click('[data-cy="toggle-all-selection"] label');
      spectator.detectChanges();
      expect(toggleAllSelectionSpy).toHaveBeenCalledWith(true);

      // WORKAROUND: onchange event is not correctly triggered with checkbox, so we set the action ourselves
      spectator.component.selection.model.select(
        ...spectator.component.treeControl.dataNodes,
      );
      spectator.triggerEventHandler(
        '[data-cy="toggle-all-selection"]',
        "change",
        {},
      );
      checkSelectionCount(3);

      // WORKAROUND: onchange event is not correctly triggered with checkbox, so we set the action ourselves
      spectator.component.selection.model.clear();
      spectator.triggerEventHandler(
        '[data-cy="toggle-all-selection"]',
        "change",
        {},
      );
      checkSelectionCount(0);
    });

    it("should activate multi-edit mode by using ctrl-key", () => {
      spectator.detectChanges();

      selectNode(0, "ctrl");

      expect(spectator.query('[data-cy="toggle-all-selection"]')).toBeVisible();
      checkSelectionCount(1);
      nodesAreMarkedForSelection(0);
    });

    it("should activate multi-edit mode by using shift-key and mark correct nodes", () => {
      spectator.detectChanges();

      selectNode(1);
      selectNode(2, "shift");

      expect(spectator.query('[data-cy="toggle-all-selection"]')).toBeVisible();
      checkSelectionCount(2);
      nodesAreMarkedForSelection(1, 2);

      selectNode(0, "shift");
      checkSelectionCount(2);
      nodesAreMarkedForSelection(0, 1);
    });

    it("should select from root when no node was selected using shift-key", () => {
      spectator.detectChanges();
      spectator.click('[data-cy="edit-button"]');

      selectNode(2, "shift");

      checkSelectionCount(3);
      nodesAreMarkedForSelection(0, 1, 2);
    });

    it("should select multiple nodes and delete them at once", fakeAsync(() => {
      spectator.detectChanges();
      spectator.click('[data-cy="edit-button"]');

      selectNode(0);
      selectNode(1);

      // @ts-ignore
      db.treeUpdates.next({
        type: UpdateType.Delete,
        data: <DocumentAbstract[]>[
          {
            id: 1,
            _uuid: "1",
            title: "",
            _type: "",
            icon: "",
            _state: "W",
            _hasChildren: false,
            _modified: null,
            _contentModified: null,
            _pendingDate: null,
            _parent: null,
            hasWritePermission: true,
            isRoot: true,
            _tags: null,
          },
          {
            id: 2,
            _uuid: "2",
            title: "",
            _type: "",
            icon: "",
            _state: "W",
            _hasChildren: false,
            _modified: null,
            _contentModified: null,
            _pendingDate: null,
            _parent: null,
            hasWritePermission: true,
            isRoot: true,
            _tags: null,
          },
        ],
      });

      tick(1000);

      hasNumberOfTreeNodes(1);
      nodeContainsTitle(0, "Test Document 3");
    }));

    it("should only select the parent but not its children, when clicking on parent", fakeAsync(() => {
      // preparation
      const firstModRececentDoc = Object.assign({}, recentDocuments[0]);
      firstModRececentDoc._hasChildren = true;
      db.initialData.and.returnValue(of([firstModRececentDoc]));
      db.getChildren.and.returnValue(of(childDocuments1).pipe(delay(2000)));
      spectator.detectChanges();

      selectNode(0);
      spectator.detectChanges();
      tick(3000);

      hasNumberOfTreeNodes(3);

      // real test starts here
      spectator.click('[data-cy="edit-button"]');
      // active node should be selected node initially
      checkSelectionCount(1);

      // when deselecting folder only deselect singe node
      selectNode(0);
      checkSelectionCount(0);

      // when selecting folder only select singe node
      selectNode(0);
      checkSelectionCount(1);

      // wait for some timers
      tick(1000);
    }));

    it("should remove a deleted node from the selection model", fakeAsync(() => {
      spectator.detectChanges();
      spectator.click('[data-cy="edit-button"]');
      let selectionModel = spectator.fixture.componentInstance.selection.model;

      expect(selectionModel.selected.length).toBe(0);
      selectNode(0);
      tick(1000);
      expect(selectionModel.selected.length).toBe(1);
      // @ts-ignore
      db.treeUpdates.next({ type: UpdateType.Delete, data: [{ id: 1 }] });

      expect(selectionModel.selected.length).toBe(0);
    }));

    xit("should mark a node as selected, after click on a search result of tree", () => {});
  });

  /*
   * Utility Functions
   */

  function hasNumberOfTreeNodes(num) {
    const nodes = spectator.queryAll(".mat-tree-node");
    expect(nodes.length).toBe(num);
  }

  function nodeContainsTitle(nodeIndex: number, title: string) {
    const nodes = spectator.queryAll(".mat-tree-node");
    expect(nodes[nodeIndex].textContent.trim()).toContain(title);
  }

  function selectNode(index: number, keyCode?: "ctrl" | "shift") {
    const nodes = spectator.queryAll(".mat-tree-node");

    if (!keyCode) {
      spectator.click(nodes[index]);
      return;
    }

    const event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      ctrlKey: keyCode === "ctrl",
      shiftKey: keyCode === "shift",
    });
    (<HTMLElement>nodes[index]).dispatchEvent(event);

    spectator.detectChanges();
  }

  function nodeHasLevel(index: number, level: number) {
    const nodes = spectator.queryAll(".mat-tree-node");
    expect(nodes[index]).toHaveStyle({
      "padding-left": `${24 * level}px`,
    });
  }

  function sendTreeEvent(
    type: UpdateType,
    docs: DocumentAbstract[],
    parent?: number,
  ) {
    db.treeUpdates.next({ type: type, data: docs, parent: parent });

    // Fixme: why this timer? Analyze!
    tick(1000);
  }

  // const nodeAtIndex = (index) => spectator.queryAll(".mat-tree-node")[index];

  const expectNode = (index) =>
    expect(spectator.queryAll(".mat-tree-node")[index]);

  /*function nodeHasClass(index: number, stateClass: string) {
    expectNode(index).toHaveClass(stateClass);
  }*/

  /*
  function nodeHasNotClass(index: number, stateClass: string) {
    expectNode(index).not.toHaveClass(stateClass);
  }
*/

  function nodeImageHasClass(index: number, stateClass: string) {
    expect(spectator.queryAll(".mat-tree-node .mat-icon")[index]).toHaveClass(
      stateClass,
    );
  }

  function nodeImageHasNotClass(index: number, stateClass: string) {
    expect(
      spectator.queryAll(".mat-tree-node .mat-icon")[index],
    ).not.toHaveClass(stateClass);
  }

  function nodeIsExpanded(index: number) {
    expect(spectator.queryAll(".mat-tree-node")[index]).toHaveClass("expanded");
  }

  function nodeIsSelected(index: number) {
    expectNode(index).toHaveClass("active");
  }

  function nodesAreMarkedForSelection(...index: number[]) {
    index.forEach((i) =>
      expect(
        spectator.queryAll(".mat-tree-node .mat-mdc-checkbox")[i],
      ).toHaveClass("mat-mdc-checkbox-checked"),
    );
  }

  function newNode(options: {
    id?;
    type?;
    state?;
    title?;
    parent?;
    updateType?: UpdateType;
  }): UpdateDatasetInfo {
    return {
      type: options.updateType || UpdateType.New,
      // @ts-ignore
      data: [
        {
          id: options.id || "123",
          _uuid: options.id || "123",
          _type: options.type || "FOLDER",
          _parent: options.parent || null,
          _state: options.state || "W",
          title: options.title || "Test Document 123",
          _hasChildren: false,
          _pendingDate: null,
          _modified: null,
          _contentModified: null,
          icon: "",
          isRoot: !options.parent,
          isAddress: null,
          _tags: null,
        },
      ],
      parent: options.parent || null,
      doNotSelect: true,
    };
  }

  function checkSelectionCount(count: number) {
    expect(
      spectator.queryAll("mat-tree mat-checkbox.mat-mdc-checkbox-checked")
        .length,
    ).toBe(count);
  }

  function checkNodeIsCheckboxSelected(index: number) {
    expect(spectator.queryAll("mat-tree mat-checkbox")[index]).toHaveClass(
      "mat-mdc-checkbox-checked",
    );
  }
});
