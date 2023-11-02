import { inject, Injectable } from "@angular/core";
import {
  FormToolbarService,
  Separator,
  ToolbarItem,
} from "../../form-shared/toolbar/form-toolbar.service";
import { TreeQuery } from "../../../store/tree/tree.query";
import { filter } from "rxjs/operators";
import { DocumentAbstract } from "../../../store/document/document.model";
import { TreeStore } from "../../../store/tree/tree.store";
import { ShortTreeNode } from "../../sidebars/tree/tree.types";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { AddressTreeStore } from "../../../store/address-tree/address-tree.store";
import { Router } from "@angular/router";
import { UpdateType } from "../../../models/update-type.enum";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { FormUtils } from "../../form.utils";
import { DocumentService } from "../../../services/document/document.service";
import { FormStateService } from "../../form-state.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "../../../services/config/config.service";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";
import { MatMenuTrigger } from "@angular/material/menu";

@Injectable()
export class HistoryPlugin extends Plugin {
  id = "plugin.history";
  name = "History Plugin";
  description =
    "Fügt Buttons hinzu, um zum vorherigen und nächsten Datensatz zu springen.";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  private stack: DocumentAbstract[] = [];

  // maximum of nodes in stack
  maxSize = 20;

  // a pointer to show were we are in the history stack
  pointer = -1;

  // when loading a node by back-Button, we don't want to add it to the stack!
  ignoreNextPush = false;

  private tree: TreeQuery | AddressTreeQuery;
  private treeStore: TreeStore | AddressTreeStore;
  private navigatePath: string;

  constructor(
    private router: Router,
    private formToolbarService: FormToolbarService,
    private docTreeStore: TreeStore,
    private addressTreeStore: AddressTreeStore,
    private docTreeQuery: TreeQuery,
    private docEvents: DocEventsService,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private addressTreeQuery: AddressTreeQuery,
    private dialog: MatDialog,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    this.setupFields();

    super.registerForm();

    this.addToolbarButtons();

    this.handleEvents();

    const treeSubscription = this.tree.openedDocument$
      .pipe(filter((doc) => doc !== null))
      .subscribe((doc) => this.addDocToStack(doc));

    const deleteSubscription = this.tree.datasetsChanged$
      .pipe(filter((info) => info?.type === UpdateType.Delete))
      .subscribe((info) => this.removeDeletedDocsFromStack(info.data));

    this.formSubscriptions.push(treeSubscription, deleteSubscription);
  }

  private setupFields() {
    if (this.forAddress) {
      this.tree = this.addressTreeQuery;
      this.treeStore = this.addressTreeStore;
      this.navigatePath = "/address";
    } else {
      this.tree = this.docTreeQuery;
      this.treeStore = this.docTreeStore;
      this.navigatePath = "/form";
    }
  }

  private addDocToStack(doc: DocumentAbstract) {
    if (this.ignoreNextPush) {
      this.ignoreNextPush = false;
      return;
    }

    // if the last node was loaded again -> ignore
    if (
      this.stack.length !== 0 &&
      doc.id === this.stack[this.stack.length - 1].id
    ) {
      return;
    }

    // remove everything after the pointer to discard nodes from history, when we came back
    this.stack.splice(this.pointer + 1);

    this.stack.push(doc);

    // if stack gets too big, then remove first item
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    } else {
      this.pointer++;
    }

    this.handleButtonState();
  }

  private eventIdNext = "HISTORY_NEXT";
  private eventIdPrevious = "HISTORY_PREVIOUS";

  private handleEvents() {
    this.formSubscriptions.push(
      // react on event when button is clicked
      this.docEvents
        .onEvent(this.eventIdNext)
        .subscribe(() => this.handleNext()),
      this.docEvents
        .onEvent(this.eventIdPrevious)
        .subscribe(() => this.handlePrevious()),
      this.docEvents
        .onEvent(`${this.eventIdPrevious}_LONGPRESS`)
        .subscribe((event) => {
          this.handleListPrevious(event.data);
        }),
      this.docEvents
        .onEvent(`${this.eventIdNext}_LONGPRESS`)
        .subscribe((event) => {
          this.handleListNext(event.data);
        }),
      this.docEvents.onEvent("HISTORY_PREVIOUS_SELECT").subscribe((item) => {
        this.handleHistoryPreviousSelect(item);
      }),
      this.docEvents.onEvent("HISTORY_NEXT_SELECT").subscribe((item) => {
        this.handleHistoryNextSelect(item);
      }),
    );
  }

  private addToolbarButtons() {
    const buttons: Array<ToolbarItem | Separator> = [
      { id: "toolBtnNewSeparator", pos: 190, isSeparator: true },
      {
        id: "toolBtnPreviousInHistory",
        tooltip: "Springe zum letzten Dokument",
        matSvgVariable: "Vorheriger-Datensatz",
        eventId: this.eventIdPrevious,
        pos: 200,
        active: false,
        hiddenMenu: [],
      },
      {
        id: "toolBtnNextInHistory",
        tooltip: "Springe zum nächsten Dokument",
        matSvgVariable: "Naechster-Datensatz",
        eventId: this.eventIdNext,
        pos: 210,
        active: false,
        hiddenMenu: [],
      },
    ];
    buttons.forEach((button) => this.formToolbarService.addButton(button));
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton("toolBtnNewSeparator");
      this.formToolbarService.removeButton("toolBtnPreviousInHistory");
      this.formToolbarService.removeButton("toolBtnNextInHistory");

      this.stack = [];
      this.pointer = -1;
    }
  }

  private handleNext() {
    // prevent too fast clicks
    if (this.ignoreNextPush) {
      return;
    }

    // in case of a long press this shall not be executed
    // if (evt.ignore) { return; }

    // close the popup if it's still open
    // popup.close(this.popupMenu);

    const node = this.stack[this.pointer + 1];
    this.ignoreNextPush = true;
    if (this.hasNext()) {
      this.pointer++;
    }
    this.gotoNode(node);
    this.handleButtonState();
  }

  private handlePrevious() {
    // prevent too fast clicks
    if (this.ignoreNextPush) {
      return;
    }

    // in case of a long press this shall not be executed
    // if (evt.ignore) { return; }

    // close the popup if it's still open
    // popup.close(this.popupMenu);

    // if current node is not last from stack we go to end of stack
    const currentOpenedDocumentId = this.tree.getOpenedDocument()?.id;
    if (currentOpenedDocumentId !== this.stack[this.pointer].id) {
      this.gotoNode(this.stack[this.pointer]);
      return;
    }

    const node = this.stack[this.pointer - 1];
    this.ignoreNextPush = true;
    if (this.pointer > 0) {
      this.pointer--;
    }
    this.gotoNode(node);
    this.handleButtonState();
  }

  private hasNext() {
    return this.pointer < this.stack.length - 1;
  }

  private hasPrevious() {
    return this.pointer > 0;
  }

  private async gotoNode(item: DocumentAbstract) {
    let handled = await FormUtils.handleDirtyForm(
      this.formStateService.getForm(),
      this.documentService,
      this.dialog,
      this.forAddress,
    );

    if (!handled) {
      return;
    }
    this.treeStore.update({
      explicitActiveNode: new ShortTreeNode(<number>item.id, item.title),
    });
    this.router.navigate([
      ConfigService.catalogId + this.navigatePath,
      { id: item._uuid },
    ]);
  }

  private handleButtonState() {
    this.formToolbarService.setButtonState(
      "toolBtnPreviousInHistory",
      this.hasPrevious(),
    );
    this.formToolbarService.setButtonState(
      "toolBtnNextInHistory",
      this.hasNext(),
    );
  }

  private removeDeletedDocsFromStack(docs: DocumentAbstract[]) {
    docs.forEach((doc) => {
      const stackItemIndex = this.stack.findIndex((item) => item.id === doc.id);
      if (stackItemIndex !== -1) {
        this.stack.splice(stackItemIndex, 1);
        if (this.stack.length === this.pointer) this.pointer--;
      }
    });
    this.handleButtonState();
  }

  private handleListNext(trigger?: MatMenuTrigger) {
    const history = this.stack.slice(this.pointer + 1).map((item) => {
      return {
        eventId: "HISTORY_NEXT_SELECT",
        label: item.title,
        data: item,
      };
    });

    this.formToolbarService.updateHiddenMenu("toolBtnNextInHistory", history);
    trigger.openMenu();
  }

  /**
   * Initiates and opens a mat-menu with clickable list of previously visited nodes
   * @param trigger
   * @private
   */
  private handleListPrevious(trigger?: MatMenuTrigger) {
    const history = this.stack
      .slice(0, this.pointer)
      .reverse()
      .map((item) => {
        return {
          eventId: "HISTORY_PREVIOUS_SELECT",
          label: item.title,
          data: item,
        };
      });

    this.formToolbarService.updateHiddenMenu(
      "toolBtnPreviousInHistory",
      history,
    );
    trigger.openMenu();
  }

  /**
   * Handles the selection of a node from previous history list
   * @param item
   * @private
   */
  private handleHistoryPreviousSelect(item: any) {
    console.log("Index:" + item.data.index);
    const currentOpenedDocumentId = this.tree.getOpenedDocument()?.id;
    if (currentOpenedDocumentId !== item.data.data.id) {
      this.pointer = this.pointer - item.data.index - 1;
      this.ignoreNextPush = true;
      this.gotoNode(item.data.data);
      this.handleButtonState();
      return;
    }
  }

  private handleHistoryNextSelect(item: any) {
    const currentOpenedDocumentId = this.tree.getOpenedDocument()?.id;
    if (currentOpenedDocumentId !== item.data.data.id) {
      this.ignoreNextPush = true;
      this.pointer = this.pointer + item.data.index + 1;
      this.gotoNode(item.data.data);
      this.handleButtonState();
      return;
    }
  }
}
