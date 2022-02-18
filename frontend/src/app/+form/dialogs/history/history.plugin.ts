import { Injectable } from "@angular/core";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
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

@Injectable()
export class HistoryPlugin extends Plugin {
  id = "plugin.history";
  _name = "History Plugin";
  group = "Toolbar";
  defaultActive = true;

  private stack: DocumentAbstract[] = [];

  // maximum of nodes in stack
  maxSize = 20;

  // a pointer to show were we are in the history stack
  pointer = -1;

  // when loading a node by back-Button, we don't want to add it to the stack!
  ignoreNextPush = false;

  // the popup showing the last/next nodes
  popupMenu = null;

  private tree: TreeQuery | AddressTreeQuery;
  private treeStore: TreeStore | AddressTreeStore;

  constructor(
    private formToolbarService: FormToolbarService,
    private docTreeStore: TreeStore,
    private addressTreeStore: AddressTreeStore,
    private docTreeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery
  ) {
    super();
  }

  get name() {
    return this._name;
  }

  register() {
    this.setupFields();

    super.register();

    this.addToolbarButtons();

    this.handleEvents();

    const treeSubscription = this.tree.openedDocument$
      .pipe(filter((doc) => doc !== null))
      .subscribe((doc) => this.addDocToStack(doc));

    this.subscriptions.push(treeSubscription);
  }

  private setupFields() {
    if (this.forAddress) {
      this.tree = this.addressTreeQuery;
      this.treeStore = this.addressTreeStore;
    } else {
      this.tree = this.docTreeQuery;
      this.treeStore = this.docTreeStore;
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

    // this.stack$.next(this.stack);
    this.handleButtonState();
  }

  private handleEvents() {
    // react on event when button is clicked
    this.formToolbarService.toolbarEvent$.subscribe((eventId) => {
      if (eventId === "HISTORY_NEXT") {
        this.handleNext();
      } else if (eventId === "HISTORY_PREVIOUS") {
        this.handlePrevious();
      }
    });

    /*
        this.stack$
          .pipe(untilDestroyed(this))
          .subscribe(stack => this.handleButtonState(stack));
    */
  }

  private addToolbarButtons() {
    const buttons: Array<ToolbarItem | Separator> = [
      { id: "toolBtnNewSeparator", pos: 190, isSeparator: true },
      {
        id: "toolBtnPreviousInHistory",
        tooltip: "Springe zum letzten Dokument",
        matSvgVariable: "Vorheriger-Datensatz",
        eventId: "HISTORY_PREVIOUS",
        pos: 200,
        active: false,
      },
      {
        id: "toolBtnNextInHistory",
        tooltip: "Springe zum nächsten Dokument",
        matSvgVariable: "Naechster-Datensatz",
        eventId: "HISTORY_NEXT",
        pos: 210,
        active: false,
      },
    ];
    buttons.forEach((button) => this.formToolbarService.addButton(button));
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton("toolBtnNewSeparator");
    this.formToolbarService.removeButton("toolBtnPreviousInHistory");
    this.formToolbarService.removeButton("toolBtnNextInHistory");

    this.stack = [];
    this.pointer = -1;
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

  private gotoNode(item: DocumentAbstract) {
    this.treeStore.update({
      explicitActiveNode: new ShortTreeNode(<string>item.id, item.title),
    });
  }

  private handleButtonState() {
    this.formToolbarService.setButtonState(
      "toolBtnPreviousInHistory",
      this.hasPrevious()
    );
    this.formToolbarService.setButtonState(
      "toolBtnNextInHistory",
      this.hasNext()
    );
  }
}
