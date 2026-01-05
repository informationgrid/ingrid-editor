/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
} from "@ngneat/spectator/vitest";
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
import { tick } from "@angular/core/testing";
import { UpdateType } from "../../../models/update-type.enum";
import {
  createDocument,
  DocumentAbstract,
} from "../../../store/document/document.model";
import { delay } from "rxjs/operators";
import { DynamicDatabase } from "./dynamic.database";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { EmptyNavigationComponent } from "./empty-navigation/empty-navigation.component";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { ReactiveFormsModule } from "@angular/forms";
import { FakeMatIconRegistry } from "@angular/material/icon/testing";
import { UpdateDatasetInfo } from "../../../models/update-dataset-info.model";
import { DocumentTreeStore } from "../../../store/tree/document-tree.store";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ConfigService } from "../../../services/config/config.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { TranslocoModule } from "@jsverse/transloco";
import { SearchInputComponent } from "../../../shared/search-input/search-input.component";
import { DocumentIconComponent } from "../../../shared/document-icon/document-icon.component";
import { getTranslocoModule } from "../../../transloco-testing.module";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { provideZonelessChangeDetection } from "@angular/core";
import { waitSomeTime } from "../../../../profiles/ingrid/utils/time";
import { vi } from "vitest";

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
      MatProgressSpinnerModule,
      MatSelectModule,
      MatSnackBarModule,
      TranslocoModule,
      SearchInputComponent,
      getTranslocoModule(),
      TreeHeaderComponent,
      EmptyNavigationComponent,
      DocumentIconComponent,
    ],
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      { provide: MatIconRegistry, useClass: FakeMatIconRegistry },
    ],
    componentMocks: [DynamicDatabase, ConfigService],
    detectChanges: false,
  });

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    spectator = createHost();
    db = spectator.inject(DynamicDatabase, true);
    db.initialData.andReturn(of(recentDocuments));
    db.treeUpdates = new Subject();
    db.mapDocumentsToTreeNodes.andCallFake(mapDocumentsToTreeNodes);
    // by default return no children when requested (can be overridden)
    db.getChildren.andReturn(of([]));
    config = spectator.inject(ConfigService, true);
    config.hasCatAdminRights.andReturn(true);
  });

  it("should create component", () => {
    expect(spectator.component).toBeDefined();
  });

  it("should show root nodes on startup", async () => {
    await spectator.fixture.whenStable();
    hasNumberOfTreeNodes(3);
    nodeContainsTitle(0, "Test Document 1");
    nodeContainsTitle(1, "Test Document 2");
    nodeContainsTitle(2, "Test Document 3");
  });

  it("should show no tree if documents have no profile info set", () => {
    db.initialData.andReturn(of([]));

    // find the title element in the DOM using a CSS selector
    hasNumberOfTreeNodes(0);
  });

  it("should add a new root node", async () => {
    await spectator.fixture.whenStable();
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
  });

  it("should modify a root node", async () => {
    await spectator.fixture.whenStable();
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
  });

  it("should delete a root node", async () => {
    await spectator.fixture.whenStable();
    // remove document via the storage service
    // @ts-ignore
    db.treeUpdates.next({ type: UpdateType.Delete, data: [{ id: 2 }] });

    // node with id '2' should be gone now
    hasNumberOfTreeNodes(2);
    const treeNode = spectator.component.dataSource.data;
    expect(treeNode[0]._id).toBe(1);
    expect(treeNode[1]._id).toBe(3);
  });

  it("should add a new child node", async () => {
    const newChildDocOf3: any = {
      id: 12345,
      _profile: "A",
      title: "child",
      _state: "W",
      _parent: 3,
    };
    db.getChildren.andCallFake((id) => {
      switch (id) {
        case 3:
          return of([newChildDocOf3]);
        default:
          throw new Error("Unknown parent: " + id);
      }
    });
    await spectator.fixture.whenStable();

    // add a new document via the storage service
    const doc = createDocument(newChildDocOf3);
    sendTreeEvent(UpdateType.New, [doc], doc._parent);

    // tree node should be expanded and show new node
    hasNumberOfTreeNodes(4);

    // when collapsing node then child should disappear
    selectNode(2);

    hasNumberOfTreeNodes(3);
  });

  it("should modify a child node", async () => {
    const newDoc: any = {
      id: 12345,
      _profile: "A",
      title: "child node",
      _state: "W",
    };
    db.getChildren.andCallFake((id) => {
      switch (id) {
        case 3:
          return of([newDoc]);
        default:
          throw new Error("Unknown parent: " + id);
      }
    });
    await spectator.fixture.whenStable();

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
  });

  it("should delete a child node", async () => {
    const newDoc: any = {
      id: 12345,
      _profile: "A",
      title: "child node",
      _state: "W",
    };
    db.getChildren.andCallFake(() => of([newDoc]));
    await spectator.fixture.whenStable();

    // add a new document and update it via the storage service
    const doc = createDocument(newDoc);
    sendTreeEvent(UpdateType.New, [doc], 3);

    hasNumberOfTreeNodes(4);

    // @ts-ignore
    sendTreeEvent(UpdateType.Delete, [{ id: 12345 }]);

    hasNumberOfTreeNodes(3);

    // TODO: check if correct node has been removed
  });

  it("should expand a node and load remote children", async () => {
    const firstModRececentDoc = Object.assign({}, recentDocuments[0]);
    firstModRececentDoc._hasChildren = true;
    db.initialData.andReturn(of([firstModRececentDoc]));
    db.getChildren.andReturn(of(childDocuments1).pipe(delay(2000)));
    await spectator.fixture.whenStable();

    selectNode(0);

    // await waitSomeTime(10);

    hasNumberOfTreeNodes(1);

    await waitSomeTime(3001);

    hasNumberOfTreeNodes(3);
  });

  it("should represent all states of a node (published, working, both)", async () => {
    db.initialData.andReturn(of(rootDocumentsWithDifferentStates));
    await spectator.fixture.whenStable();

    hasNumberOfTreeNodes(3);
    nodeImageHasClass(0, "published");
    nodeImageHasNotClass(0, "working");
    nodeImageHasClass(1, "working");
    nodeImageHasNotClass(1, "published");
    nodeImageHasClass(2, "workingWithPublished");
    nodeImageHasNotClass(2, "working");
    nodeImageHasNotClass(2, "published");
  });

  it("should initially expand to a deeply nested node", async () => {
    db.getPath.andReturn(Promise.resolve([1, 2, 3, 4]));
    db.initialData.andReturn(of(deeplyNestedDocumentsRoot));
    db.getChildren.andCallFake((id) => {
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

    spectator.component.activeNodeId.set(4);
    await waitSomeTime();

    hasNumberOfTreeNodes(4);

    nodeIsExpanded(0);
    nodeIsExpanded(1);
    nodeIsExpanded(2);
    nodeContainsTitle(3, "Nested Document");
    nodeIsSelected(3);
  });

  it.skip("should reload the tree (nodes expanded state remembered?)", () => {});

  it.skip("should delete a node which has multiple versions (draft, published, ...)", () => {});

  it("should copy a root node to root", async () => {
    db.initialData.andReturn(of(recentDocuments));
    await spectator.fixture.whenStable();

    hasNumberOfTreeNodes(3);

    db.treeUpdates.next(newNode({ title: "Test Document 4" }));

    hasNumberOfTreeNodes(4);

    // new folder should be last
    nodeContainsTitle(3, "Test Document 4");
  });

  it.skip("should copy a root node to a folder", () => {});

  it.skip("should copy a child node to root", () => {});

  it.skip("should copy a whole tree/folder to root", () => {});

  it("should move a root node to root?", async () => {
    db.getPath.andReturn(Promise.resolve([1]));
    db.initialData.andReturn(of(recentDocuments));
    await spectator.fixture.whenStable();

    hasNumberOfTreeNodes(3);

    db.treeUpdates.next(
      newNode({ updateType: UpdateType.Move, id: 1, parent: null }),
    );

    await spectator.fixture.whenStable();
    hasNumberOfTreeNodes(3);

    // new folder should be last
    nodeContainsTitle(0, "Test Document 1");
  });

  it("should move a root node to a folder", async () => {
    const documentTreeStore = spectator.inject(DocumentTreeStore);
    documentTreeStore.set(recentDocuments);

    db.getPath.andReturn(Promise.resolve([1]));
    db.initialData.andReturn(of(recentDocuments));
    db.getChildren.andCallFake((parentId) =>
      of(documentTreeStore.getChildren(parentId)),
    );
    await spectator.fixture.whenStable();

    hasNumberOfTreeNodes(3);

    // store must be updated where getChildren info comes from
    documentTreeStore.update(1, { _parent: 2 });
    db.treeUpdates.next(
      newNode({ updateType: UpdateType.Move, id: 1, parent: 2 }),
    );

    await waitSomeTime();
    hasNumberOfTreeNodes(3);

    // new folder should be last
    nodeContainsTitle(0, "Test Document 2");
    nodeContainsTitle(1, "Test Document 1");
    nodeContainsTitle(2, "Test Document 3");

    // nodeIsExpanded(0);
    nodeHasLevel(1, 1);
  });

  it.skip("should move a child node to root", () => {});

  it.skip("should move a whole tree/folder to root", () => {});

  it("should select a node when clicking on it", async () => {
    db.initialData.andReturn(of(rootDocumentsWithDifferentStates));
    await spectator.fixture.whenStable();

    selectNode(0);
    nodeIsSelected(0);
    selectNode(1);
    nodeIsSelected(1);
    selectNode(2);

    nodeIsSelected(2);
  });

  it.skip("should find a node by search", () => {});

  it.skip("should show no result info if search did not found anything", () => {});

  it.skip("should deselect all nodes when a new one is added (#1722)", () => {});

  it.skip("should add a folder under another folder two levels deeper", () => {
    // all folders must not be expanded initially
  });

  describe("Multi-Selection", () => {
    beforeEach(() => {
      spectator.setInput("showMultiSelectButton", true);
    });

    it("should enable and disable multi selection mode", () => {
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

    it.skip("should check/uncheck all nodes at once", () => {
      spectator.click('[data-cy="edit-button"]');

      const toggleAllSelectionSpy = vi.spyOn(
        spectator.component.selection,
        "toggleAllSelection",
      );
      expect(toggleAllSelectionSpy).toHaveBeenCalledTimes(0);

      // ATTENTION: checkbox needs first click event before change events are triggered correctly
      spectator.click('[data-cy="toggle-all-selection"] label');
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

    it("should activate multi-edit mode by using ctrl-key", async () => {
      selectNode(0, "ctrl");
      await spectator.fixture.whenStable();

      // TODO:
      // expect(spectator.query('[data-cy="toggle-all-selection"]')).toBeVisible();
      checkSelectionCount(1);
      nodesAreMarkedForSelection(0);
    });

    it("should activate multi-edit mode by using shift-key and mark correct nodes", async () => {
      selectNode(1);
      selectNode(2, "shift");
      await spectator.fixture.whenStable();

      // TODO:
      //   expect(spectator.query('[data-cy="toggle-all-selection"]')).toBeVisible();
      checkSelectionCount(2);
      nodesAreMarkedForSelection(1, 2);

      selectNode(0, "shift");
      await spectator.fixture.whenStable();
      checkSelectionCount(2);
      nodesAreMarkedForSelection(0, 1);
    });

    it("should select from root when no node was selected using shift-key", async () => {
      spectator.click('[data-cy="edit-button"]');

      selectNode(2, "shift");
      await spectator.fixture.whenStable();

      checkSelectionCount(3);
      nodesAreMarkedForSelection(0, 1, 2);
    });

    it("should select multiple nodes and delete them at once", () => {
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

      hasNumberOfTreeNodes(1);
      nodeContainsTitle(0, "Test Document 3");
    });

    it("should only select the parent but not its children, when clicking on parent", () => {
      // preparation
      const firstModRececentDoc = Object.assign({}, recentDocuments[0]);
      firstModRececentDoc._hasChildren = true;
      db.initialData.andReturn(of([firstModRececentDoc]));
      db.getChildren.andReturn(of(childDocuments1).pipe(delay(2000)));

      selectNode(0);

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
    });

    it("should remove a deleted node from the selection model", () => {
      spectator.click('[data-cy="edit-button"]');
      let selectionModel = spectator.fixture.componentInstance.selection.model;

      expect(selectionModel.selected.length).toBe(0);
      selectNode(0);
      expect(selectionModel.selected.length).toBe(1);
      // @ts-ignore
      db.treeUpdates.next({ type: UpdateType.Delete, data: [{ id: 1 }] });

      expect(selectionModel.selected.length).toBe(0);
    });

    it.skip("should mark a node as selected, after click on a search result of tree", () => {});
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
      bubbles: true,
      ctrlKey: keyCode === "ctrl",
      shiftKey: keyCode === "shift",
    });
    (<HTMLElement>nodes[index]).dispatchEvent(event);
  }

  function nodeHasLevel(index: number, level: number) {
    // TODO: vitest cannot test specific style attributes
    /*const nodes = spectator.queryAll(".mat-tree-node");
    expect(nodes[index].computedStyleMap().get("padding-left")).toBe(
      `${24 * level}px`,
    );*/
  }

  function sendTreeEvent(
    type: UpdateType,
    docs: DocumentAbstract[],
    parent?: number,
  ) {
    db.treeUpdates.next({ type: type, data: docs, parent: parent });
  }

  // const nodeAtIndex = (index) => spectator.queryAll(".mat-tree-node")[index];

  const expectNode = (index) => spectator.queryAll(".mat-tree-node")[index];

  /*function nodeHasClass(index: number, stateClass: string) {
      expectNode(index).toHaveClass(stateClass);
    }*/

  /*
    function nodeHasNotClass(index: number, stateClass: string) {
      expectNode(index).not.toHaveClass(stateClass);
    }
  */

  function nodeImageHasClass(index: number, stateClass: string) {
    expect(
      spectator
        .queryAll(".mat-tree-node .mat-icon")
        [index].classList.contains(stateClass),
    ).toBe(true);
  }

  function nodeImageHasNotClass(index: number, stateClass: string) {
    expect(
      spectator
        .queryAll(".mat-tree-node .mat-icon")
        [index].classList.contains(stateClass),
    ).toBe(false);
  }

  function nodeIsExpanded(index: number) {
    expect(
      spectator
        .queryAll(".mat-tree-node")
        [index].classList.contains("expanded"),
    ).toBe(true);
  }

  function nodeIsSelected(index: number) {
    expectNode(index).classList.contains("active");
  }

  function nodesAreMarkedForSelection(...index: number[]) {
    index.forEach((i) =>
      expect(
        spectator
          .queryAll(".mat-tree-node .mat-mdc-checkbox")
          [i].classList.contains("mat-mdc-checkbox-checked"),
      ).toBe(true),
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
    expect(
      spectator
        .queryAll("mat-tree mat-checkbox")
        [index].classList.contains("mat-mdc-checkbox-checked"),
    ).toBe(true);
  }
});
